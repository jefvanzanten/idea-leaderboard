<script lang="ts">
  import { getIdeaStore } from "$lib/ideaStore.svelte";
  import IdeaCard from "./IdeaCard.svelte";

  const store = getIdeaStore();
</script>

{#if store.ideas.length > 0}
  <div class="ideas-grid">
    {#each store.ideas as idea}
      <IdeaCard {idea} />
    {/each}
  </div>
{:else}
  <div>
    <p>Geen ideeen nog. Voeg toe met de + knop!</p>
  </div>
{/if}

<style>
  .ideas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    padding: 16px;
    width: 100%;
    align-self: start;
  }
</style>
