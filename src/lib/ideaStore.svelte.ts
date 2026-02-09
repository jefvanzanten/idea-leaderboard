import {
  getAllIdeas,
  addIdea as repoAddIdea,
  editIdea as repoEditIdea,
  updateIdeasOrder,
} from "$lib/db/ideaRepository";
import type { Idea, IdeaFormData } from "$lib/types";

let ideas: Idea[] = $state([]);
let editingIdea: Idea | null = $state(null);

async function loadIdeas(): Promise<void> {
  ideas = await getAllIdeas();
  editingIdea = null;
}

function setEditingIdea(idea: Idea): void {
  editingIdea = idea;
}

function clearEditingIdea(): void {
  editingIdea = null;
}

async function storeAddIdea(data: IdeaFormData): Promise<void> {
  await repoAddIdea(data);
  await loadIdeas();
}

async function editCurrentIdea(data: IdeaFormData): Promise<void> {
  if (!editingIdea) return;
  await repoEditIdea(editingIdea.id, editingIdea.thumbURL, data);
  clearEditingIdea();
  await loadIdeas();
}

function previewIdeasOrder(nextIdeas: Idea[]): void {
  ideas = nextIdeas.map((idea, index) => ({
    ...idea,
    sortIndex: index,
  }));
}

async function reorderIdeas(nextIdeas: Idea[]): Promise<void> {
  previewIdeasOrder(nextIdeas);
  await updateIdeasOrder(
    ideas.map((idea) => ({
      id: idea.id,
      sortIndex: idea.sortIndex,
    })),
  );
}

export function getIdeaStore() {
  return {
    get ideas() {
      return ideas;
    },
    get editingIdea() {
      return editingIdea;
    },

    loadIdeas,
    setEditingIdea,
    clearEditingIdea,
    addIdea: storeAddIdea,
    editCurrentIdea,
    previewIdeasOrder,
    reorderIdeas,
  };
}
