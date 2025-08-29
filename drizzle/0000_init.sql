CREATE TABLE "bluesky_posts" (
	"uri" text PRIMARY KEY NOT NULL,
	"cid" text NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bluesky_profiles" (
	"did" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "danbooru_bluesky_posts" (
	"danbooru_post_id" integer NOT NULL,
	"bluesky_post_uri" text NOT NULL,
	CONSTRAINT "danbooru_bluesky_posts_danbooru_post_id_bluesky_post_uri_pk" PRIMARY KEY("danbooru_post_id","bluesky_post_uri")
);
--> statement-breakpoint
CREATE TABLE "danbooru_posts" (
	"id" integer PRIMARY KEY NOT NULL,
	"tags" text[] NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "danbooru_bluesky_posts" ADD CONSTRAINT "danbooru_bluesky_posts_danbooru_post_id_danbooru_posts_id_fk" FOREIGN KEY ("danbooru_post_id") REFERENCES "public"."danbooru_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "danbooru_bluesky_posts" ADD CONSTRAINT "danbooru_bluesky_posts_bluesky_post_uri_bluesky_posts_uri_fk" FOREIGN KEY ("bluesky_post_uri") REFERENCES "public"."bluesky_posts"("uri") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "handle_idx" ON "bluesky_profiles" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "tags_idx" ON "danbooru_posts" USING gin ("tags");