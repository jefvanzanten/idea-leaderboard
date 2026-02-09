import { db } from ".";
import {
  ideas as ideasTable,
  categories,
  images,
  ideaImages,
} from "$lib/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { invoke } from "@tauri-apps/api/core";
import type { Idea, IdeaFormData } from "$lib/types";

export async function getAllIdeas(): Promise<Idea[]> {
  const rows = await db
    .select({
      id: ideasTable.id,
      title: ideasTable.title,
      description: ideasTable.description,
      sortIndex: ideasTable.sortIndex,
      categoryId: ideasTable.categoryId,
      thumbURL: ideasTable.thumbURL,
      createdAt: ideasTable.createdAt,
      categoryName: categories.name,
    })
    .from(ideasTable)
    .leftJoin(categories, eq(ideasTable.categoryId, categories.id))
    .orderBy(asc(ideasTable.sortIndex));

  return Promise.all(
    rows.map(async (row) => {
      let thumbDataUrl: string | null = null;
      if (row.thumbURL) {
        try {
          thumbDataUrl = await invoke("read_image_as_data_url", {
            sourcePath: row.thumbURL,
          });
        } catch {
          thumbDataUrl = null;
        }
      }
      return {
        ...row,
        categoryName: row.categoryName ?? undefined,
        thumbDataUrl,
      };
    }),
  );
}

export async function updateIdea(
  id: number,
  data: {
    title: string;
    description: string | null;
    categoryId: number | null;
    thumbURL: string | null;
  },
) {
  await db.update(ideasTable).set(data).where(eq(ideasTable.id, id));
}

export async function updateIdeasOrder(
  order: Array<{ id: number; sortIndex: number }>,
): Promise<void> {
  for (const item of order) {
    await db
      .update(ideasTable)
      .set({ sortIndex: item.sortIndex })
      .where(eq(ideasTable.id, item.id));
  }
}

export async function addIdea(data: IdeaFormData): Promise<void> {
  let thumbURL: string | null = null;
  if (data.selectedImagePath) {
    thumbURL = await invoke("copy_image_to_app_data", {
      sourcePath: data.selectedImagePath,
    });
  }

  const [orderInfo] = await db
    .select({
      maxSortIndex: sql<number>`coalesce(max(${ideasTable.sortIndex}), -1)`,
    })
    .from(ideasTable);
  const nextSortIndex = Number(orderInfo?.maxSortIndex ?? -1) + 1;

  const [inserted] = await db
    .insert(ideasTable)
    .values({
      title: data.title,
      description: data.description || null,
      categoryId: data.categoryId ?? null,
      thumbURL,
      sortIndex: nextSortIndex,
    })
    .returning();

  for (const albumPath of data.albumPaths) {
    const savedPath: string = await invoke("copy_image_to_app_data", {
      sourcePath: albumPath,
    });
    const [img] = await db
      .insert(images)
      .values({ url: savedPath })
      .returning();
    await db.insert(ideaImages).values({
      ideaId: inserted.id,
      imageId: String(img.id),
    });
  }
}

export async function editIdea(
  id: number,
  currentThumbURL: string | null,
  data: IdeaFormData,
): Promise<void> {
  let thumbURL = currentThumbURL;
  if (data.selectedImagePath) {
    thumbURL = await invoke("copy_image_to_app_data", {
      sourcePath: data.selectedImagePath,
    });
  }
  await updateIdea(id, {
    title: data.title,
    description: data.description || null,
    categoryId: data.categoryId ?? null,
    thumbURL,
  });
}
