import { Schema } from "effect";

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/actor/defs.json#L75-L124 | atproto/lexicons/app/bsky/actor/defs.json} */
export class AppBskyActorDefsProfileViewDetailed extends Schema.Class<AppBskyActorDefsProfileViewDetailed>("app.bsky.actor.defs#profileViewDetailed")({
  did: Schema.String,
  handle: Schema.String,
}) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/actor/getProfile.json#L19-L25 | atproto/lexicons/app/bsky/actor/getProfile.json} */
export class AppBskyActorGetProfileOutput extends Schema.Class<AppBskyActorGetProfileOutput>("app.bsky.actor.getProfile#output")(
  AppBskyActorDefsProfileViewDetailed.fields,
) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/embed/images.json#L47-L70 | atproto/lexicons/app/bsky/embed/images.json} */
export class AppBskyEmbedImagesViewImage extends Schema.Class<AppBskyEmbedImagesViewImage>("app.bsky.embed.images#viewImage")({
  thumb: Schema.String,
}) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/embed/images.json#L36-L46 | atproto/lexicons/app/bsky/embed/images.json} */
export class AppBskyEmbedImagesView extends Schema.Class<AppBskyEmbedImagesView>("app.bsky.embed.images#view")({
  $type: Schema.Literal("app.bsky.embed.images#view"),
  images: Schema.Array(AppBskyEmbedImagesViewImage),
}) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/embed/video.json#L48-L65 | atproto/lexicons/app/bsky/embed/video.json} */
export class AppBskyEmbedVideoView extends Schema.Class<AppBskyEmbedVideoView>("app.bsky.embed.video#view")({
  $type: Schema.Literal("app.bsky.embed.video#view"),
  cid: Schema.String,
  playlist: Schema.String,
}) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/embed/external.json#L40-L49 | atproto/lexicons/app/bsky/embed/external.json} */
export class AppBskyEmbedExternalViewExternal extends Schema.Class<AppBskyEmbedExternalViewExternal>("app.bsky.embed.external#view")({
  uri: Schema.String,
  title: Schema.String,
  description: Schema.String,
}) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/embed/external.json#L30-L39 | atproto/lexicons/app/bsky/embed/external.json} */
export class AppBskyEmbedExternalView extends Schema.Class<AppBskyEmbedExternalView>("app.bsky.embed.external#view")({
  $type: Schema.Literal("app.bsky.embed.external#view"),
  external: AppBskyEmbedExternalViewExternal,
}) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/embed/record.json#L13-L31 | atproto/lexicons/app/bsky/embed/record.json} */
export class AppBskyEmbedRecordView extends Schema.Class<AppBskyEmbedRecordView>("app.bsky.embed.record#view")({
  $type: Schema.Literal("app.bsky.embed.record#view"),
  record: Schema.Unknown,
}) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/embed/recordWithMedia.json#L24-L40 | atproto/lexicons/app/bsky/embed/recordWithMedia.json} */
export class AppBskyEmbedRecordWithMediaView extends Schema.Class<AppBskyEmbedRecordWithMediaView>("app.bsky.embed.recordWithMedia#view")({
  $type: Schema.Literal("app.bsky.embed.recordWithMedia#view"),
  media: Schema.Unknown,
}) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/feed/defs.json#L5-L38 | atproto/blob/9a1746a/lexicons/app/bsky/feed/defs.json} */
export class AppBskyFeedPostView extends Schema.Class<AppBskyFeedPostView>("app.bsky.feed.defs#postView")({
  uri: Schema.String,
  cid: Schema.String,
  author: Schema.Unknown,
  record: Schema.Unknown,
  embed: Schema.optional(
    Schema.Union(
      AppBskyEmbedImagesView,
      AppBskyEmbedVideoView,
      AppBskyEmbedExternalView,
      AppBskyEmbedRecordView,
      AppBskyEmbedRecordWithMediaView,
    ),
  ),
  indexedAt: Schema.Date,
}) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/feed/defs.json#L58-L76 | atproto/lexicons/app/bsky/feed/defs.json} */
export class AppBskyFeedDefsFeedViewPost extends Schema.Class<AppBskyFeedDefsFeedViewPost>("app.bsky.feed.defs#feedViewPost")({
  post: AppBskyFeedPostView
}) { };

/** @see {@link https://github.com/bluesky-social/atproto/blob/9a1746a/lexicons/app/bsky/feed/getAuthorFeed.json#L38-L54 | atproto/lexicons/app/bsky/feed/getAuthorFeed.json} */
export class AppBskyFeedGetAuthorFeedOutput extends Schema.Class<AppBskyFeedGetAuthorFeedOutput>("app.bsky.feed.getAuthorFeed#output")({
  cursor: Schema.optional(Schema.String),
  feed: Schema.Array(AppBskyFeedDefsFeedViewPost),
}) { };
