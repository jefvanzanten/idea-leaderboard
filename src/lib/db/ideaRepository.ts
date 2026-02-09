import { db } from ".";
import { ideas as ideasTable, categories, images, ideaImages } from "$lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { invoke } from "@tauri-apps/api/core";
import type { Idea, IdeaFormData } from "$lib/types";

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
    .leftJoin(categories, eq(ideasTable.categoryId, categories.id))
    .orderBy(desc(ideasTable.stars));

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

export async function updateIdeaRating(id: number, stars: number) {
  await db.update(ideasTable).set({ stars }).where(eq(ideasTable.id, id));
}

export async function addIdea(data: IdeaFormData): Promise<void> {
  let thumbURL: string | null = null;
  if (data.selectedImagePath) {
    thumbURL = await invoke("copy_image_to_app_data", {
      sourcePath: data.selectedImagePath,
    });
  }

  const [inserted] = await db
    .insert(ideasTable)
    .values({
      title: data.title,
      description: data.description || null,
      stars: data.rating,
      categoryId: data.categoryId ?? null,
      thumbURL,
    })
    .returning();

  for (const albumPath of data.albumPaths) {
    const savedPath: string = await invoke("copy_image_to_app_data", {
      sourcePath: albumPath,
    });
    const [img] = await db.insert(images).values({ url: savedPath }).returning();
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
    stars: data.rating,
    categoryId: data.categoryId ?? null,
    thumbURL,
  });
}
