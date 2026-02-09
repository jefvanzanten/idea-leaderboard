export type IdeaFormData = {
  title: string;
  description: string;
  categoryId: number | undefined;
  rating: number;
  selectedImagePath: string | null;
  albumPaths: string[];
};

export type IdeaFormInitial = {
  title?: string;
  description?: string;
  categoryId?: number;
  rating?: number;
  previewUrl?: string | null;
};

export type Idea = {
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
