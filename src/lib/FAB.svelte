<script lang="ts">
  let { onclick }: { onclick?: () => void } = $props();
</script>

<button {onclick}>+</button>

<style>
  button {
    --btn-size: 60px;
    font-size: 40px;
    width: var(--btn-size);
    height: var(--btn-size);
    color: white;
    border: none;
    border-radius: 50%;
    background-color: rgb(19, 189, 104);
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    cursor: pointer;
  }
</style>
