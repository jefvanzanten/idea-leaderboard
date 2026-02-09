<script lang="ts">
  import type { Idea } from "./types";
  import Rating from "./Rating.svelte";

  let {
    idea,
    onRate,
    onclick,
  }: {
    idea: Idea;
    onRate?: (ideaId: number, stars: number) => void;
    onclick?: () => void;
  } = $props();

  let rating = $state(idea.stars ?? 0);

  $effect(() => {
    rating = idea.stars ?? 0;
  });

  function handleRate() {
    onRate?.(idea.id, rating);
  }
</script>

<div class="idea-card" {onclick} role="button" tabindex="0">
  {#if idea.thumbDataUrl}
    <img src={idea.thumbDataUrl} alt={idea.title} class="idea-thumb" />
  {:else}
    <div class="idea-thumb-placeholder"></div>
  {/if}
  <div class="idea-info">
    <h3>{idea.title}</h3>
    {#if idea.categoryName}
      <span class="category-badge">{idea.categoryName}</span>
    {/if}
    {#if idea.description}
      <p class="idea-description">{idea.description}</p>
    {/if}
    <div
      class="idea-stars"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <Rating bind:rating size={16} onRate={handleRate} />
    </div>
  </div>
</div>

<style>
  .idea-card {
    border-radius: 10px;
    overflow: hidden;
    background: rgb(42, 46, 52);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.15s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .idea-thumb {
    width: 100%;
    height: 140px;
    object-fit: cover;
  }

  .idea-thumb-placeholder {
    width: 100%;
    height: 140px;
    background: rgb(60, 64, 70);
  }

  .idea-info {
    padding: 12px;
  }

  .idea-info h3 {
    margin: 0 0 6px;
    font-size: 1rem;
    color: white;
  }

  .category-badge {
    display: inline-block;
    font-size: 0.75rem;
    background: rgb(19, 189, 104);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    margin-bottom: 6px;
  }

  .idea-description {
    margin: 6px 0;
    font-size: 0.85rem;
    color: #aaa;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .idea-stars {
    margin-top: 4px;
  }
</style>
