<script lang="ts">
  import { onMount } from "svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { invoke } from "@tauri-apps/api/core";
  import { db } from "./db";
  import { categories } from "./db/schema";
  import type { IdeaFormData, IdeaFormInitial } from "./types";

  let {
    submitLabel = "Voeg toe",
    initialValues,
    onSubmit,
  }: {
    submitLabel?: string;
    initialValues?: IdeaFormInitial;
    onSubmit: (data: IdeaFormData) => Promise<void>;
  } = $props();

  let categoriesData: { id: number; name: string }[] = $state([]);
  let selectedImagePath: string | null = $state(null);
  let previewUrl: string | null = $state(null);
  let albumPaths: string[] = $state([]);
  let albumPreviewUrls: string[] = $state([]);

  let title = $state("");
  let description = $state("");
  let categoryId = $state<number | undefined>(undefined);

  onMount(async () => {
    categoriesData = await db.select().from(categories);
    if (!initialValues?.categoryId && categoriesData.length > 0) {
      categoryId = categoriesData[0].id;
    }
  });

  $effect(() => {
    if (initialValues) {
      title = initialValues.title ?? "";
      description = initialValues.description ?? "";
      categoryId = initialValues.categoryId;
      previewUrl = initialValues.previewUrl ?? null;
      selectedImagePath = null;
      albumPaths = [];
      albumPreviewUrls = [];
    } else {
      resetForm();
    }
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
      previewUrl = await invoke("read_image_as_data_url", {
        sourcePath: selectedImagePath,
      });
    }
  }

  async function pickAlbumImages() {
    const paths = await open({
      multiple: true,
      filters: [
        {
          name: "Afbeeldingen",
          extensions: ["png", "jpg", "jpeg", "webp", "gif"],
        },
      ],
    });
    if (paths && Array.isArray(paths)) {
      albumPaths = [...albumPaths, ...paths];
      const newUrls: string[] = [];
      for (const p of albumPaths) {
        const dataUrl: string = await invoke("read_image_as_data_url", {
          sourcePath: p,
        });
        newUrls.push(dataUrl);
      }
      albumPreviewUrls = newUrls;
    }
  }

  function removeAlbumImage(index: number) {
    albumPaths = albumPaths.filter((_, i) => i !== index);
    albumPreviewUrls = albumPreviewUrls.filter((_, i) => i !== index);
  }

  function resetForm() {
    title = "";
    description = "";
    selectedImagePath = null;
    previewUrl = null;
    albumPaths = [];
    albumPreviewUrls = [];
    if (categoriesData.length > 0) {
      categoryId = categoriesData[0].id;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      selectedImagePath,
      albumPaths,
    });

    resetForm();
  }
</script>

<form onsubmit={handleSubmit}>
  <div class="row">
    <label>Cover image</label>
    <div class="img-row">
      {#if previewUrl}
        <div class="thumb-wrapper">
          <img src={previewUrl} alt="Cover preview" class="thumb" />
          <button
            type="button"
            class="remove-btn"
            onclick={() => {
              selectedImagePath = null;
              previewUrl = null;
            }}>×</button
          >
        </div>
      {/if}
      {#if !previewUrl}
        <button type="button" class="add-img-btn" onclick={pickCoverImage}
          >+</button
        >
      {/if}
    </div>
  </div>
  <div class="row">
    <label for="idea-name">Titel</label>
    <textarea class="title" name="idea-name" bind:value={title}></textarea>
  </div>
  <div class="row">
    <label for="idea-description">Beschrijving</label>
    <textarea name="idea-description" bind:value={description}></textarea>
  </div>
  <div class="row">
    <label for="category">Categorie</label>
    <select name="category" bind:value={categoryId}>
      {#each categoriesData as cat}
        <option value={cat.id}>{cat.name}</option>
      {/each}
    </select>
  </div>
  <div class="row">
    <label>Album</label>
    <div class="img-row">
      {#each albumPreviewUrls as url, i}
        <div class="thumb-wrapper">
          <img src={url} alt="Album {i + 1}" class="thumb" />
          <button
            type="button"
            class="remove-btn"
            onclick={() => removeAlbumImage(i)}>×</button
          >
        </div>
      {/each}
      <button type="button" class="add-img-btn" onclick={pickAlbumImages}
        >+</button
      >
    </div>
  </div>
  <div class="row">
    <span></span>
    <button type="submit" class="submit-btn">{submitLabel}</button>
  </div>
</form>

<style>
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
    select {
      width: 60%;
    }

    textarea {
      min-height: 6em;
    }

    .title {
      min-height: 2em;
    }
  }

  .submit-btn {
    width: 60%;
    background-color: rgb(52, 57, 63);
    padding: 6px 0;
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
  }

  .img-row {
    width: 60%;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .add-img-btn {
    width: 80px;
    height: 80px;
    border: 2px dashed #555;
    border-radius: 8px;
    background: none;
    color: #888;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #999;
      color: #ccc;
    }
  }

  .thumb-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .thumb {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    display: block;
  }

  .remove-btn {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 20px;
    height: 20px;
    padding: 0;
    font-size: 12px;
    line-height: 1;
    border: none;
    border-radius: 50%;
    background: #e74c3c;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
