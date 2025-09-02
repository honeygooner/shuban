export * from "#internal/atproto/schema";
import { AppBskyActorGetProfileOutput, AppBskyFeedGetAuthorFeedOutput } from "#internal/atproto/schema";
import { decodeJsonError, decodeJsonResponse, makeClient } from "#internal/util";
import { FetchHttpClient, HttpClient, HttpClientRequest, type UrlParams } from "@effect/platform";
import { Chunk, Config, Effect, Function, Option, Schema, Stream } from "effect";

export class Bluesky extends Effect.Service<Bluesky>()("@/bluesky", {
  dependencies: [FetchHttpClient.layer],
  effect: Effect.gen(function* () {
    const url = yield* Function.pipe(
      Config.url("BLUESKY_URL"),
      Config.withDefault(new URL("https://public.api.bsky.app")),
    );
    return Function.pipe(
      yield* makeClient(url.href),
      HttpClient.mapRequest(HttpClientRequest.acceptJson),
      HttpClient.transformResponse(decodeJsonError(BlueskyError))
    );
  }),
}) { };

export class BlueskyError extends Schema.Class<BlueskyError>("@/bluesky/error")({
  error: Schema.String,
  message: Schema.String,
}) { };

/** @see {@link https://docs.bsky.app/docs/api/app-bsky-feed-get-author-feed | docs} */
export const getAuthorFeed = (urlParams?: UrlParams.CoercibleRecord) =>
  Function.pipe(
    Bluesky.use((client) => client.get("/xrpc/app.bsky.feed.getAuthorFeed", { urlParams })),
    Effect.flatMap(decodeJsonResponse(AppBskyFeedGetAuthorFeedOutput)),
  );

export const getAuthorFeedStream = (urlParams?: UrlParams.CoercibleRecord) =>
  Stream.paginateChunkEffect(undefined as string | undefined, (cursor) =>
    Function.pipe(
      getAuthorFeed({ ...urlParams, cursor }),
      Effect.map(({ feed, cursor }) => [Chunk.fromIterable(feed), Option.fromNullable(cursor)]),
    ),
  );

/** @see {@link https://docs.bsky.app/docs/api/app-bsky-actor-get-profile | docs} */
export const getProfile = (urlParams?: UrlParams.CoercibleRecord) =>
  Function.pipe(
    Bluesky.use((client) => client.get("/xrpc/app.bsky.actor.getProfile", { urlParams })),
    Effect.flatMap(decodeJsonResponse(AppBskyActorGetProfileOutput)),
  );

/** @throws {TypeError} if `URLPattern` cannot be constructed */
export const getIdentifierSync = (profileUrl: string) => {
  /** @see {@link https://github.com/bluesky-social/social-app/blob/cced762/src/routes.ts#L26} */
  const pattern = new URLPattern("https://bsky.app/profile/:name");
  return Option.fromNullable(pattern.exec(profileUrl)?.pathname.groups.name);
};

export const MAX_LIMIT = 100;
