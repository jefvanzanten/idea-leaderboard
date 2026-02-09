<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { updateIdea } from "./db/ideaRepository";
  import IdeaForm from "./IdeaForm.svelte";
  import type { Idea, IdeaFormData, IdeaFormInitial } from "./types";

  let { idea, onSaved }: { idea: Idea; onSaved?: () => void } = $props();

  let initialValues: IdeaFormInitial = $derived({
    title: idea.title,
    description: idea.description ?? "",
    categoryId: idea.categoryId ?? undefined,
    rating: idea.stars ?? 0,
    previewUrl: idea.thumbDataUrl,
  });

  async function handleEdit(data: IdeaFormData) {
    let thumbURL = idea.thumbURL;
    if (data.selectedImagePath) {
      thumbURL = await invoke("copy_image_to_app_data", {
        sourcePath: data.selectedImagePath,
      });
    }

    await updateIdea(idea.id, {
      title: data.title,
      description: data.description || null,
      stars: data.rating,
      categoryId: data.categoryId ?? null,
      thumbURL,
    });

    (document.getElementById("editIdeaForm") as HTMLDialogElement)?.close();
    onSaved?.();
  }
</script>

<dialog id="editIdeaForm" class="idea-modal">
  <IdeaForm submitLabel="Opslaan" {initialValues} onSubmit={handleEdit} />
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
