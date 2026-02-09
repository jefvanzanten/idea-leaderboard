<script lang="ts">
  import { getIdeaStore } from "$lib/ideaStore.svelte";
  import IdeaCard from "./IdeaCard.svelte";
  import type { Idea } from "./types";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  const store = getIdeaStore();

  type DndEventDetail = { items: Idea[] };

  function handleConsider(event: CustomEvent<DndEventDetail>) {
    store.previewIdeasOrder(event.detail.items);
  }

  async function handleFinalize(event: CustomEvent<DndEventDetail>) {
    await store.reorderIdeas(event.detail.items);
  }
</script>

{#if store.ideas.length > 0}
  <div
    class="ideas-grid"
    use:dndzone={{ items: store.ideas, flipDurationMs: 150, delayTouchStart: 200 }}
    onconsider={handleConsider}
    onfinalize={handleFinalize}
  >
    {#each store.ideas as idea (idea.id)}
      <div class="idea-item" animate:flip={{ duration: 150 }}>
        <IdeaCard {idea} />
      </div>
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
    grid-template-columns: repeat(
      auto-fill,
      minmax(
        min(var(--idea-card-min-width), var(--idea-card-min-width-mobile)),
        1fr
      )
    );
    gap: 16px;
    padding: 16px;
    width: 100%;
    align-self: start;
  }

  @media (min-width: 680px) {
    .ideas-grid {
      --idea-card-min-width-mobile: var(--idea-card-min-width);
    }
  }

  .idea-item {
    cursor: grab;
  }
</style>
