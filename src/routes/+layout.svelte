<script lang="ts">
  /** Layout data bevat db.migrationsOk van +layout.ts (na runMigrations). */
  import type { Snippet } from "svelte";
  let { children }: { data: any; children: Snippet } = $props();
  import "../style.css/";
</script>

{@render children()}
