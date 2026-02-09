import { db } from ".";
import { ideas as ideasTable, categories } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { invoke } from "@tauri-apps/api/core";
import type { Idea } from "$lib/types";

export async function getAllIdeas(): Promise<Idea[]> {
  const rows = await db
    .select({
      id: ideasTable.id,
      title: ideasTable.title,
      description: ideasTable.description,
      stars: ideasTable.stars,
      categoryId: ideasTable.categoryId,
      thumbURL: ideasTable.thumbURL,
      createdAt: ideasTable.createdAt,
      categoryName: categories.name,
    })
    .from(ideasTable)
    .leftJoin(categories, eq(ideasTable.categoryId, categories.id));

  return Promise.all(
    rows.map(async (row) => {
      let thumbDataUrl: string | null = null;
      if (row.thumbURL) {
        thumbDataUrl = await invoke("read_image_as_data_url", {
          sourcePath: row.thumbURL,
        });
      }
      return { ...row, categoryName: row.categoryName ?? undefined, thumbDataUrl };
    }),
  );
}

export async function updateIdea(
  id: number,
  data: {
    title: string;
    description: string | null;
    stars: number;
    categoryId: number | null;
    thumbURL: string | null;
  },
) {
  await db.update(ideasTable).set(data).where(eq(ideasTable.id, id));
}
