<script lang="ts">
  import { onMount } from "svelte";
  import { getIdeaStore } from "$lib/ideaStore.svelte";
  import IdeaForm from "./IdeaForm.svelte";
  import type { IdeaFormData, IdeaFormInitial } from "../types";

  const store = getIdeaStore();

  let dialogEl: HTMLDialogElement;

  let initialValues: IdeaFormInitial = $derived({
    title: store.editingIdea?.title ?? "",
    description: store.editingIdea?.description ?? "",
    categoryId: store.editingIdea?.categoryId ?? undefined,
    previewUrl: store.editingIdea?.thumbDataUrl,
  });

  onMount(() => {
    dialogEl?.showModal();
  });

  async function handleEdit(data: IdeaFormData) {
    await store.editCurrentIdea(data);
  }
</script>

<dialog
  bind:this={dialogEl}
  class="idea-modal"
  onclose={() => store.clearEditingIdea()}
>
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
