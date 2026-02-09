<script lang="ts">
  import Rating from "./Rating.svelte";
  let { rating = $bindable(0) }: { rating: number } = $props();
</script>

<div class="row">
  <label for="rating-bar">Rating</label>
  <div class="rating-wrapper">
    <Rating bind:rating />
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

  .rating-wrapper {
    width: 60%;
  }
</style>
