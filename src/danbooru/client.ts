export * from "#internal/danbooru/schema";
import { ArtistUrl, IqdbQuery } from "#internal/danbooru/schema";
import { decodeJsonError, decodeJsonResponse, makeClient } from "#internal/util";
import { FetchHttpClient, HttpClient, HttpClientRequest, type UrlParams } from "@effect/platform";
import { Chunk, Config, Effect, Function, Option, RateLimiter, Schema, Stream } from "effect";

export class Danbooru extends Effect.Service<Danbooru>()("@/danbooru", {
  dependencies: [FetchHttpClient.layer],
  scoped: Effect.gen(function* () {
    const url = yield* Function.pipe(
      Config.url("DANBOORU_URL"),
      Config.withDefault(new URL("https://danbooru.donmai.us")),
    );
    const rateLimit = yield* RateLimiter.make({
      algorithm: "fixed-window",
      interval: "1 second",
      limit: 5,
    });
    return Function.pipe(
      yield* makeClient(url.href),
      HttpClient.mapRequest(HttpClientRequest.acceptJson),
      HttpClient.transformResponse(rateLimit),
      HttpClient.transformResponse(decodeJsonError(DanbooruError)),
    );
  }),
}) { };

export class DanbooruError extends Schema.Class<DanbooruError>("@/danbooru/error")({
  error: Schema.String,
  message: Schema.String,
  backtrace: Schema.NullOr(Schema.Array(Schema.String)),
  success: Schema.Literal(false),
}) { };

export const getArtistUrls = (urlParams?: UrlParams.CoercibleRecord) =>
  Function.pipe(
    Danbooru.use((client) => client.get("/artist_urls.json", { urlParams })),
    Effect.flatMap(decodeJsonResponse(Schema.Array(ArtistUrl))),
  );

export const getArtistUrlsStream = (urlParams?: UrlParams.CoercibleRecord) =>
  Stream.paginateChunkEffect(undefined as string | undefined, (page) =>
    Function.pipe(
      Effect.map(getArtistUrls({ ...urlParams, page }), Chunk.fromIterable),
      Effect.map((urls) => [urls, Option.map(Chunk.last(urls), ({ id }) => `b${id}`)]),
    ),
  );

export const getIqdbQueries = (urlParams?: UrlParams.CoercibleRecord) =>
  Function.pipe(
    Danbooru.use((client) => client.get("/iqdb_queries.json", { urlParams })),
    Effect.flatMap(decodeJsonResponse(Schema.Array(IqdbQuery))),
  );

export const DUPLICATE_THRESHOLD = 92;
export const MAX_LIMIT = 1000;
