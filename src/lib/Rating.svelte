<script lang="ts">
  const startCount = 5;
  let {
    rating = $bindable(0),
    onRate,
    size = 26,
  }: { rating: number; onRate?: () => void; size?: number } = $props();
  let hoverRating = $state(0);

  function handleClick(i: number) {
    rating = i + 1;
    onRate?.();
  }
</script>

<div class="rating-bar" style="--star-size: {size}px" onmouseleave={() => (hoverRating = 0)}>
  {#each { length: startCount } as _, i}
    <button
      type="button"
      class:active={i < (hoverRating || rating)}
      onmouseenter={() => (hoverRating = i + 1)}
      onclick={() => handleClick(i)}>★</button
    >
  {/each}
</div>

<style>
  button {
    border: none;
    padding: 0;
    margin: 0;
    font-size: var(--star-size, 26px);
    background: none;
    color: #ccc;
    cursor: pointer;

    &.active {
      color: gold;
    }
  }
</style>
