import { HttpClient, HttpClientError, HttpClientRequest, HttpClientResponse, UrlParams } from "@effect/platform";
import { Effect, Function, type RateLimiter, Schedule, Schema } from "effect";
import pkg from "../package.json" with { type: "json" };

export const decodeJsonResponse = HttpClientResponse.schemaBodyJson;

export const makeClient = <E, I, R>(options: {
  readonly baseUrl: string;
  readonly errorSchema: Schema.Schema<E, I, R>;
  readonly rateLimiter?: RateLimiter.RateLimiter;
}) =>
  Effect.map(
    HttpClient.HttpClient,
    Function.flow(
      HttpClient.mapRequest(HttpClientRequest.prependUrl(options.baseUrl)),
      HttpClient.mapRequest(HttpClientRequest.setHeader("Accept", "application/json")),
      HttpClient.mapRequest(HttpClientRequest.setHeader("User-Agent", `${pkg.name}/${pkg.version} (${pkg.repository.url})`)),
      HttpClient.transform(options.rateLimiter || Function.identity),
      HttpClient.tap(({ request, status }) =>
        Function.pipe(
          Effect.logDebug(`${status} ${request.method} ${request.url}`),
          Effect.annotateLogs(UrlParams.toRecord(request.urlParams)),
        ),
      ),
      HttpClient.filterStatusOk,
      HttpClient.transformResponse(
        Effect.catchIf(
          (error) => error instanceof HttpClientError.ResponseError,
          (error) =>
            Function.pipe(
              Effect.flatMap(error.response.json, Schema.decodeUnknown(options.errorSchema)),
              Effect.flatMap(Effect.fail),
            ),
        ),
      ),
      HttpClient.retryTransient({
        schedule: Schedule.jittered(Schedule.exponential("0.5 seconds")),
        times: 5,
      }),
    ),
  );
