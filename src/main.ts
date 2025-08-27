import * as Bluesky from "#internal/atproto/client";
import * as Danbooru from "#internal/danbooru/client";
import * as State from "#internal/state";
import { DevTools } from "@effect/experimental";
import { NodeRuntime, NodeSocket } from "@effect/platform-node";
import { Effect, Function, Layer, Option, Schema, Stream } from "effect";

const program = Function.pipe(
  Danbooru.getArtistUrlsStream({
    limit: Danbooru.MAX_LIMIT,
    "search[url_matches]": "bsky.app",
  }),
  Stream.filterMap(({ url }) => Bluesky.getIdentifierSync(url)),
  Stream.mapEffect(
    (actor) => Effect.option(Bluesky.getProfile({ actor })),
    { concurrency: 10, unordered: true },
  ),
  Stream.filterMap(Option.map(({ did }) => did)),
  Stream.filterEffect(State.Artists.add),
  Stream.flatMap((did) =>
    Bluesky.getAuthorFeedStream({
      actor: did,
      filter: ["posts_no_replies", "posts_with_media"],
      limit: Bluesky.MAX_LIMIT,
    }),
    { concurrency: 5 },
  ),
  Stream.flatMap(({ post }) =>
    Function.pipe(
      post.embed,
      Schema.validateOption(Bluesky.AppBskyEmbedImagesView),
      Option.map(({ images }) => images),
      Option.getOrElse(() => []),
      Stream.fromIterable,
      Stream.mapEffect(({ thumb }) =>
        Effect.option(
          Danbooru.getIqdbQueries({
            limit: 1,
            "search[similarity]": Danbooru.DUPLICATE_THRESHOLD,
            "search[url]": thumb
          }),
        ),
      ),
      Stream.filterMap(Option.flatMap(Option.fromIterable)),
      Stream.tap(({ post_id: postId }) => State.Posts.add(postId, post.uri)),
    ),
  ),
  Stream.runDrain,
);

Function.pipe(
  program,
  Effect.provide([
    Layer.provide(
      DevTools.layerWebSocket(),
      NodeSocket.layerWebSocketConstructor,
    ),
    Bluesky.Bluesky.Default,
    Danbooru.Danbooru.Default,
    State.Artists.Default,
    State.Posts.Default,
  ]),
  NodeRuntime.runMain,
);
