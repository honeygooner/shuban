import { DevTools } from "@effect/experimental";
import { NodeRuntime, NodeSocket } from "@effect/platform-node";
import { Effect, Function, Layer } from "effect";

const program = Effect.log("hello world");

const DevToolsLive = Layer.provide(
  DevTools.layerWebSocket(),
  NodeSocket.layerWebSocketConstructor,
);

Function.pipe(
  Effect.provide(program, DevToolsLive),
  NodeRuntime.runMain,
);
