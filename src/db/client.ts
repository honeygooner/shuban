import * as schema from "#internal/db/schema";
import { blueskyProfiles } from "#internal/db/schema";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { Config, Data, Effect } from "effect";

export class Database extends Effect.Service<Database>()("@/db", {
  scoped: Effect.gen(function* () {
    const databaseUrl = yield* Config.string("DATABASE_URL");
    const db = drizzle({ connection: databaseUrl, schema });
    // see: https://github.com/porsager/postgres/blob/32feb25/README.md#teardown--cleanup
    yield* Effect.addFinalizer(() => Effect.promise(() => db.$client.end({ timeout: 0 })));
    return db;
  }),
}) {
  static readonly $use = <T>(op: (db: Database) => PromiseLike<T>) =>
    Effect.mapError(Database.use(op), (error) => new DatabaseError({ cause: error }));
};

export class DatabaseError extends Data.TaggedError("DatabaseError")<{ cause: unknown; }> { };

export const filterProfile = (actor: string) =>
  Database.$use((db) =>
    db.query.blueskyProfiles
      .findFirst({
        columns: { did: true },
        where: (table, { and, eq, gte, or, sql }) =>
          or(
            and(eq(table.did, actor), gte(table.indexedAt, sql`now() - interval '1 day'`)),
            and(eq(table.handle, actor), gte(table.indexedAt, sql`now() - interval '1 hour'`)),
          ),
      })
      .then((row) => !row),
  );

export const upsertProfile = ({ did, handle }: typeof blueskyProfiles.$inferInsert) =>
  Database.$use(async (db) => {
    await db.insert(blueskyProfiles).values({ did, handle }).onConflictDoUpdate({
      set: { did, handle, indexedAt: sql`now()` },
      target: blueskyProfiles.did,
    });
  });
