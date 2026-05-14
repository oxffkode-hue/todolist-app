export interface Todo {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFilters {
  categoryId?: string;
  isCompleted?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface CreateTodoRequest {
  title: string;
  categoryId: string;
  description?: string;
  dueDate?: string | null;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  categoryId?: string;
  isCompleted?: boolean;
}
