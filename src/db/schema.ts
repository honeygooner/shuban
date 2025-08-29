import { index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const blueskyPosts = pgTable("bluesky_posts", {
  uri: text("uri").primaryKey(),
  cid: text("cid").notNull(),
  indexedAt: timestamp("indexed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const blueskyProfiles = pgTable("bluesky_profiles", {
  did: text("did").primaryKey(),
  handle: text("handle").notNull(),
  indexedAt: timestamp("indexed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("handle_idx").on(table.handle)]);

export const danbooruPosts = pgTable("danbooru_posts", {
  id: integer("id").primaryKey(),
  tags: text("tags").array().notNull(),
  indexedAt: timestamp("indexed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("tags_idx").using("gin", table.tags)]);

export const danbooruBlueskyPosts = pgTable("danbooru_bluesky_posts", {
  danbooruPostId: integer("danbooru_post_id").notNull().references(() => danbooruPosts.id, { onDelete: "cascade" }),
  blueskyPostUri: text("bluesky_post_uri").notNull().references(() => blueskyPosts.uri, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.danbooruPostId, table.blueskyPostUri] })]);
