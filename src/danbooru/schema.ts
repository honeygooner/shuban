import { Schema } from "effect";

export class ArtistUrl extends Schema.Class<ArtistUrl>("artist_urls#index")({
  id: Schema.Number,
  artist_id: Schema.Number,
  url: Schema.String,
  created_at: Schema.Date,
  updated_at: Schema.Date,
  is_active: Schema.Boolean,
}) { };

export class IqdbQuery extends Schema.Class<IqdbQuery>("iqdb_queries#show")({
  post_id: Schema.Number,
}) { };
