<script lang="ts">
  import AddIdeaForm from "$lib/AddIdeaForm.svelte";
  import FAB from "$lib/FAB.svelte";
  const ideas = [];
</script>

<main class="container">
  <AddIdeaForm />
  {#if ideas.length > 0}
    //
  {:else}
    <div>
      <p>Geen ideeen nog. Voeg toe met de + knop!</p>
    </div>
  {/if}
  <FAB />
</main>

<style>
  * {
    box-sizing: border-box;
    border: none;
  }

  :root {
    font-size: 16px;
  }

  .container {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
  }
</style>
