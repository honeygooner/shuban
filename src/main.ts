import * as Bluesky from "#internal/atproto/client";
import * as Danbooru from "#internal/danbooru/client";
import * as Database from "#internal/db/client";
import { DevTools } from "@effect/experimental";
import { NodeRuntime, NodeSocket } from "@effect/platform-node";
import { Effect, Function, Layer, Logger, LogLevel, Option, Stream } from "effect";

const program = Function.pipe(
  Danbooru.getArtistUrlsStream({
    limit: Danbooru.MAX_LIMIT,
    "search[url_matches]": "bsky.app",
  }),
  Stream.filterMap(({ url }) => Bluesky.getIdentifierSync(url)),
  Stream.filterEffect(Database.filterProfile),
  Stream.mapEffect((actor) =>
    Function.pipe(
      Bluesky.getProfile({ actor }),
      Effect.map(Option.some),
      Effect.catchTag("BlueskyError", () => Effect.succeedNone),
    ),
    { concurrency: 10 },
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
    Logger.minimumLogLevel(LogLevel.Debug),
    Bluesky.Bluesky.Default,
    Danbooru.Danbooru.Default,
    Database.Database.Default,
  ]),
  NodeRuntime.runMain,
);
