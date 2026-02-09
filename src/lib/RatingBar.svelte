<script lang="ts">
  const startCount = 5;
  let { rating = $bindable(0) }: { rating: number } = $props();
  let hoverRating = $state(0);

  function handleClick(i: number) {
    rating = i + 1;
  }
</script>

<div class="row">
  <label for="rating-bar">Rating</label>
  <div id="rating-bar" onmouseleave={() => (hoverRating = 0)}>
    {#each { length: startCount } as _, i}
      <button
        type="button"
        class:active={i < (hoverRating || rating)}
        onmouseenter={() => (hoverRating = i + 1)}
        onclick={() => handleClick(i)}
      >★</button>
    {/each}
  </div>
</div>

<style>
  .row {
    align-items: center;
  }

  label {
    text-align: right;
    width: 40%;
  }

  #rating-bar {
    width: 60%;
  }

  button {
    border: none;
    padding: 0;
    margin: 0;
    font-size: 26px;
    background: none;
    color: #ccc;
    cursor: pointer;

    &.active {
      color: gold;
    }
  }
</style>
