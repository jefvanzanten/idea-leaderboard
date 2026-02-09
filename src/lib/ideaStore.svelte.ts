import {
  getAllIdeas,
  addIdea as repoAddIdea,
  editIdea as repoEditIdea,
  updateIdeaRating,
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

async function rateIdea(ideaId: number, stars: number): Promise<void> {
  ideas = ideas
    .map((idea) => (idea.id === ideaId ? { ...idea, stars } : idea))
    .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
  await updateIdeaRating(ideaId, stars);
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
    rateIdea,
  };
}
