<script lang="ts">
  import { onMount, tick } from "svelte";
  import AddIdeaForm from "$lib/AddIdeaForm.svelte";
  import EditIdeaForm from "$lib/EditIdeaForm.svelte";
  import { getAllIdeas, updateIdeaRating } from "$lib/db/ideaRepository";
  import FAB from "$lib/FAB.svelte";
  import IdeaList from "$lib/IdeaList.svelte";
  import type { Idea } from "$lib/types";

  let ideas: Idea[] = $state([]);
  let editingIdea: Idea | null = $state(null);

  async function loadIdeas() {
    ideas = await getAllIdeas();
    editingIdea = null;
  }

  function handleAddIdea() {
    (document.getElementById("addIdeaForm") as HTMLDialogElement)?.showModal();
  }

  async function handleEditIdea(idea: Idea) {
    editingIdea = idea;
    await tick();
    (document.getElementById("editIdeaForm") as HTMLDialogElement)?.showModal();
  }

  async function handleRateIdea(ideaId: number, stars: number) {
    ideas = ideas
      .map((idea) => (idea.id === ideaId ? { ...idea, stars } : idea))
      .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
    await updateIdeaRating(ideaId, stars);
  }

  onMount(loadIdeas);
</script>

<main class="container">
  <AddIdeaForm onSaved={loadIdeas} />
  {#if editingIdea}
    <EditIdeaForm idea={editingIdea} onSaved={loadIdeas} />
  {/if}
  <IdeaList {ideas} onEditIdea={handleEditIdea} onRateIdea={handleRateIdea} />
  <FAB onclick={handleAddIdea} />
</main>

<style>
  .container {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
  }
</style>
