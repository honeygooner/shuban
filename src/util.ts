import { HttpClient, HttpClientError, HttpClientRequest, HttpClientResponse, UrlParams } from "@effect/platform";
import { Effect, Function, LogLevel, Schedule, Schema } from "effect";
import pkg from "../package.json" with { type: "json" };

export const decodeJsonResponse = <A, I, R>(schema: Schema.Schema<A, I, R>, level = LogLevel.Debug) =>
  (response: HttpClientResponse.HttpClientResponse) =>
    Function.pipe(
      Effect.flatMap(response.json, Schema.decodeUnknown(schema)),
      Effect.mapError(toResponseError({ reason: "Decode", response })),
      Effect.tap((value) =>
        Function.pipe(
          Effect.logWithLevel(level, `${response.status} ${response.request.method} ${response.request.url}`, value),
          Effect.annotateLogs(UrlParams.toRecord(response.request.urlParams)),
        ),
      ),
    );

export const decodeJsonError = <A, I, R>(schema: Schema.Schema<A, I, R>) =>
  Effect.flatMap((response: HttpClientResponse.HttpClientResponse) =>
    response.status >= 200 && response.status < 300
      ? Effect.succeed(response)
      : Effect.flatMap(
        decodeJsonResponse(schema, LogLevel.Error)(response),
        toResponseError({ reason: "StatusCode", response }),
      ),
  );

export const makeClient = (url: URL | string) =>
  Effect.map(HttpClient.HttpClient, (client) =>
    client.pipe(
      HttpClient.mapRequest(HttpClientRequest.prependUrl(url.toString())),
      HttpClient.mapRequest(
        HttpClientRequest.setHeader("User-Agent", `${pkg.name}/${pkg.version} (${pkg.repository.url})`),
      ),
      HttpClient.retry({
        schedule: Schedule.jittered(Schedule.exponential("0.5 seconds")),
        while: (error) =>
          error instanceof HttpClientError.ResponseError &&
          retryStatuses.includes(error.response.status),
      }),
    ),
  );

const toResponseError =
  (ctx: Pick<HttpClientError.ResponseError, "reason" | "response">) =>
    (cause: unknown) =>
      cause instanceof HttpClientError.ResponseError
        ? cause
        : new HttpClientError.ResponseError({ ...ctx, cause, request: ctx.response.request });

const retryStatuses = Object.freeze([
  408, // request timeout
  429, // too many requests (can be enhanced with headers)
  500, // internal server error
  503, // service unavailable
  504, // gateway timeout
]);
