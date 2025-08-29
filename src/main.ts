import * as Bluesky from "#internal/atproto/client";
import * as Danbooru from "#internal/danbooru/client";
import * as Database from "#internal/db/client";
import { DevTools } from "@effect/experimental";
import { NodeRuntime, NodeSocket } from "@effect/platform-node";
import { Effect, Function, Layer, Option, Stream } from "effect";

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
  Stream.filterMapEffect(Option.map(Database.upsertProfile)),
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
    Database.Database.Default,
  ]),
  NodeRuntime.runMain,
);
