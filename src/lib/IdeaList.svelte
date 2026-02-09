<script lang="ts">
  import type { Idea } from "./types";
  import IdeaCard from "./IdeaCard.svelte";

  let { ideas, onEditIdea }: { ideas: Idea[]; onEditIdea?: (idea: Idea) => void } = $props();
</script>

{#if ideas.length > 0}
  <div class="ideas-grid">
    {#each ideas as idea}
      <IdeaCard {idea} onclick={() => onEditIdea?.(idea)} />
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
