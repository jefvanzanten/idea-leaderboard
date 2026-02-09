<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { db } from "$lib/db";
  import { ideas as ideasTable, categories } from "$lib/db/schema";
  import { eq } from "drizzle-orm";
  import AddIdeaForm from "$lib/AddIdeaForm.svelte";
  import FAB from "$lib/FAB.svelte";

  type Idea = {
    id: number;
    title: string;
    description: string | null;
    stars: number | null;
    categoryId: number | null;
    thumbURL: string | null;
    thumbDataUrl: string | null;
    createdAt: string;
    categoryName?: string;
  };

  let ideas: Idea[] = $state([]);

  async function loadIdeas() {
    const rows = await db
      .select({
        id: ideasTable.id,
        title: ideasTable.title,
        description: ideasTable.description,
        stars: ideasTable.stars,
        categoryId: ideasTable.categoryId,
        thumbURL: ideasTable.thumbURL,
        createdAt: ideasTable.createdAt,
        categoryName: categories.name,
      })
      .from(ideasTable)
      .leftJoin(categories, eq(ideasTable.categoryId, categories.id));

    ideas = await Promise.all(
      rows.map(async (row) => {
        let thumbDataUrl: string | null = null;
        if (row.thumbURL) {
          thumbDataUrl = await invoke("read_image_as_data_url", {
            sourcePath: row.thumbURL,
          });
        }
        return { ...row, thumbDataUrl };
      })
    );
  }

  onMount(() => {
    loadIdeas();
  });
</script>

<main class="container">
  <AddIdeaForm onIdeaAdded={loadIdeas} />
  {#if ideas.length > 0}
    <div class="ideas-grid">
      {#each ideas as idea}
        <div class="idea-card">
          {#if idea.thumbDataUrl}
            <img
              src={idea.thumbDataUrl}
              alt={idea.title}
              class="idea-thumb"
            />
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
            {#if idea.stars && idea.stars > 0}
              <div class="idea-stars">
                {#each { length: 5 } as _, i}
                  <span class:active={i < (idea.stars ?? 0)}>★</span>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
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

  .ideas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    padding: 16px;
    width: 100%;
    align-self: start;
  }

  .idea-card {
    border-radius: 10px;
    overflow: hidden;
    background: rgb(42, 46, 52);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.15s ease;

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

    span {
      font-size: 16px;
      color: #555;

      &.active {
        color: gold;
      }
    }
  }
</style>
