export interface Category {
  id: string;
  userId: string | null;
  name: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
}

export interface UpdateCategoryRequest {
  name: string;
  icon: string;
}
