import { HttpClient, HttpClientRequest, HttpClientResponse, UrlParams } from "@effect/platform";
import { Effect, Function, LogLevel, type RateLimiter, Schedule, Schema } from "effect";
import pkg from "../package.json" with { type: "json" };

export const decodeJsonResponse = <A, I, R>(schema: Schema.Schema<A, I, R>, level = LogLevel.Debug) =>
  (response: HttpClientResponse.HttpClientResponse) =>
    Effect.tap(HttpClientResponse.schemaBodyJson(schema)(response), (value) =>
      Function.pipe(
        Effect.logWithLevel(level, `${response.status} ${response.request.method} ${response.request.url}`, value),
        Effect.annotateLogs(UrlParams.toRecord(response.request.urlParams)),
      ),
    );

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
      HttpClient.filterStatusOk,
      HttpClient.retryTransient({
        schedule: Schedule.jittered(Schedule.exponential("0.5 seconds")),
        times: 5,
      }),
      HttpClient.transformResponse(
        Effect.catchTag("ResponseError", ({ response }) =>
          Effect.flatMap(decodeJsonResponse(options.errorSchema, LogLevel.Error)(response), Effect.fail),
        ),
      ),
    ),
  );
