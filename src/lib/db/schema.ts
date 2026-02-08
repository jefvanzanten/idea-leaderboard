import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const ideas = sqliteTable("ideas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull().unique(),
  description: text("description"),
  stars: integer("stars"),
  categoryId: integer("category_id").references(() => categories.id),
  thumbURL: text("thumb_url"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const images = sqliteTable("images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
});

export const ideaImages = sqliteTable("idea_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ideaId: integer("idea_id")
    .references(() => ideas.id)
    .notNull(),
  imageId: text("image_id")
    .references(() => images.id)
    .unique()
    .notNull(),
});
