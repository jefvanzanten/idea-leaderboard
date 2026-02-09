<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { db } from "./db";
  import { ideas, images, ideaImages } from "./db/schema";
  import IdeaForm from "./IdeaForm.svelte";
  import type { IdeaFormData } from "./types";

  let { onSaved }: { onSaved?: () => void } = $props();

  async function handleAdd(data: IdeaFormData) {
    let thumbURL: string | null = null;
    if (data.selectedImagePath) {
      thumbURL = await invoke("copy_image_to_app_data", {
        sourcePath: data.selectedImagePath,
      });
    }

    const [inserted] = await db
      .insert(ideas)
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

      const [img] = await db
        .insert(images)
        .values({ url: savedPath })
        .returning();

      await db.insert(ideaImages).values({
        ideaId: inserted.id,
        imageId: String(img.id),
      });
    }

    (document.getElementById("addIdeaForm") as HTMLDialogElement)?.close();
    onSaved?.();
  }
</script>

<dialog id="addIdeaForm" class="idea-modal">
  <IdeaForm submitLabel="Voeg toe" onSubmit={handleAdd} />
</dialog>

<style>
  .idea-modal {
    padding: 1em;
    min-width: 40%;
    border: none;
    border-radius: 10px;

    &::backdrop {
      background: rgba(0, 0, 0, 0.4);
    }
  }
</style>
