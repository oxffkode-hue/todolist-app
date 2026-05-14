import axiosInstance from './axiosInstance';
import type { ApiSuccessResponse, MessageResponse } from '../types/api.types';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

export async function getCategories(): Promise<Category[]> {
  const res = await axiosInstance.get<ApiSuccessResponse<Category[]>>('/categories');
  return res.data.data;
}

export async function createCategory(payload: CreateCategoryRequest): Promise<Category> {
  const res = await axiosInstance.post<ApiSuccessResponse<Category>>('/categories', payload);
  return res.data.data;
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryRequest,
): Promise<Category> {
  const res = await axiosInstance.patch<ApiSuccessResponse<Category>>(
    `/categories/${id}`,
    payload,
  );
  return res.data.data;
}

export async function deleteCategory(id: string): Promise<MessageResponse> {
  const res = await axiosInstance.delete<ApiSuccessResponse<MessageResponse>>(
    `/categories/${id}`,
  );
  return res.data.data;
}
