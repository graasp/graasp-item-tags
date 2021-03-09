CREATE TYPE "nested_tag_enum" AS ENUM ('clean', 'fail');

CREATE TABLE "tag" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  -- 'name' might not be the final label for the user but a (recognizable) short english label that behaves as a key for translation
  "name" character varying(100) NOT NULL,
  -- "creator" uuid REFERENCES "member" ("id") ON DELETE SET NULL, -- don't remove - set creator to NULL
  "nested" nested_tag_enum DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE TABLE "item_tag" (
  "id" uuid UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  -- delete row if tag is deleted
  "tag_id" uuid REFERENCES "tag" ("id") ON DELETE CASCADE,
  -- delete row if item is deleted; update path if item's path is updated.
  "item_path" ltree REFERENCES "item" ("path") ON DELETE CASCADE ON UPDATE CASCADE,
  "creator" uuid REFERENCES "member" ("id") ON DELETE SET NULL, -- don't remove - set creator to NULL

  "created_at" timestamp NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
  PRIMARY KEY ("tag_id", "item_path")
);
CREATE INDEX "item_tag_item_path_idx" ON "item_tag" USING gist ("item_path");
