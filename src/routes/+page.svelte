<script lang="ts">
  import { onMount } from "svelte";
  import { getIdeaStore } from "$lib/ideaStore.svelte";
  import AddIdeaForm from "$lib/components/AddIdeaForm.svelte";
  import EditIdeaForm from "$lib/components/EditIdeaForm.svelte";
  import IdeaList from "$lib/components/IdeaList.svelte";
  import FAB from "$lib/components/FAB.svelte";

  const store = getIdeaStore();

  let addDialogOpen = $state(false);

  onMount(store.loadIdeas);
</script>

<main class="container">
  <AddIdeaForm open={addDialogOpen} onclose={() => (addDialogOpen = false)} />
  {#if store.editingIdea}
    <EditIdeaForm />
  {/if}
  <IdeaList />
  <FAB onclick={() => (addDialogOpen = true)} />
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
