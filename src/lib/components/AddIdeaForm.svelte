<script lang="ts">
  import { getIdeaStore } from "$lib/ideaStore.svelte";
  import IdeaForm from "./IdeaForm.svelte";
  import type { IdeaFormData } from "../types";

  let { open, onclose }: { open: boolean; onclose?: () => void } = $props();

  const store = getIdeaStore();

  let dialogEl: HTMLDialogElement;

  $effect(() => {
    if (open) {
      dialogEl?.showModal();
    } else {
      dialogEl?.close();
    }
  });

  async function handleAdd(data: IdeaFormData) {
    await store.addIdea(data);
    onclose?.();
  }
</script>

<dialog bind:this={dialogEl} class="idea-modal" {onclose}>
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
