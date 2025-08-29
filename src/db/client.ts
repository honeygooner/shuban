import * as Bluesky from "#internal/atproto/client";
import { blueskyProfiles } from "#internal/db/schema";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { Config, Data, Effect } from "effect";

export class Database extends Effect.Service<Database>()("@/db", {
  effect: Effect.map(Config.string("DATABASE_URL"), drizzle),
}) {
  static readonly usePromise = <T>(f: (db: Database) => PromiseLike<T>) =>
    Database.use((db) =>
      Effect.tryPromise({
        try: () => f(db),
        catch: (error) => new DatabaseError({ cause: error }),
      }),
    );
}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{ cause: unknown; }> { };

export const upsertProfile = ({ did, handle }: Bluesky.AppBskyActorGetProfileOutput) =>
  Database.usePromise(async (db) => {
    await db.insert(blueskyProfiles).values({ did, handle }).onConflictDoUpdate({
      set: { did, handle, indexedAt: sql`now()` },
      target: blueskyProfiles.did,
    });
  });
