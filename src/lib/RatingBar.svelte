<script lang="ts">
  const startCount = 5;
  let currentRating = $state(0);

  const handleClick = () => {};
</script>

<div class="row">
  <label for="rating-bar">Rating</label>
  <div id="rating-bar">
    {#each { length: startCount } as _, i}
      <button onclick={() => handleClick}>★</button>
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

    &:hover {
      color: gold;
    }
  }
</style>
