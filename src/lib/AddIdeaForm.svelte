<script lang="ts">
  import { onMount } from "svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { invoke } from "@tauri-apps/api/core";
  import { db } from "./db";
  import { categories } from "./db/schema";
  import RatingBar from "./RatingBar.svelte";

  let categoriesData: { id: number; name: string }[] = $state([]);
  let selectedImagePath: string | null = $state(null);
  let previewUrl: string | null = $state(null);

  onMount(async () => {
    categoriesData = await db.select().from(categories);
  });

  async function pickCoverImage() {
    const path = await open({
      multiple: false,
      filters: [
        {
          name: "Afbeeldingen",
          extensions: ["png", "jpg", "jpeg", "webp", "gif"],
        },
      ],
    });
    if (path) {
      selectedImagePath = path as string;
      previewUrl = convertFileSrc(selectedImagePath);
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!selectedImagePath) return;

    const savedPath: string = await invoke("copy_image_to_app_data", {
      sourcePath: selectedImagePath,
    });

    console.log("Image saved to:", savedPath);
    // TODO: insert idea met savedPath als thumbURL
  }
</script>

<div id="addIdeaForm" popover="auto">
  <form onsubmit={handleSubmit}>
    <div class="row img-btn-ctn">
      <label for="cover-btn">Cover image</label>
      <button type="button" name="cover-btn" onclick={pickCoverImage}>
        {#if previewUrl}
          <img src={previewUrl} alt="Cover preview" class="preview" />
        {:else}
          Image
        {/if}
      </button>
    </div>
    <div class="row">
      <label for="idea-name">Titel</label>
      <textarea class="title" name="idea-name"></textarea>
    </div>
    <div class="row">
      <label for="idea-description">Beschrijving</label>
      <textarea name="idea-description"></textarea>
    </div>
    <div class="row">
      <label for="category">Categorie</label>
      <select name="category">
        {#each categoriesData as cat}
          <option value={cat.id}>{cat.name}</option>
        {/each}
      </select>
    </div>
    <RatingBar />
    <div class="row">
      <span></span>
      <button type="submit">Voeg toe</button>
    </div>
  </form>
</div>

<style>
  #addIdeaForm {
    padding: 1em;
    min-width: 40%;
    border: none;
    border-radius: 10px;
    inset: auto;
    margin: 0;
    position-anchor: --fab;
    bottom: anchor(top);
    right: anchor(left);

    transform-origin: bottom right;
    transition:
      scale 0.1s 0.05s ease-out,
      opacity 0.1s 0.05s ease-out,
      overlay 0.05s allow-discrete,
      display 0.05s allow-discrete;

    scale: 0;
    opacity: 0;

    &:popover-open {
      display: block;
      scale: 1;
      opacity: 1;

      @starting-style {
        scale: 0;
        opacity: 0;
      }
    }

    &::backdrop {
      background: color-mix(in srgb, rgba(0, 0, 0, 0.4), white 10%);
      transition:
        background 0.15s ease-out,
        overlay 0.05s allow-discrete,
        display 0.05s allow-discrete;

      @starting-style {
        background: transparent;
      }
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: none;

    label,
    span {
      text-align: right;
      width: 40%;
    }

    input,
    textarea,
    select,
    button {
      width: 60%;
    }

    textarea {
      min-height: 6em;
    }

    .title {
      min-height: 2em;
    }

    button {
      background-color: rgb(52, 57, 63);
      padding: 6px 0;
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
    }

    .img-btn-ctn {
      align-items: center;
    }

    .preview {
      width: 100%;
      max-height: 120px;
      object-fit: cover;
      border-radius: 6px;
    }
  }
</style>
