import axiosInstance from './axiosInstance';
import type { ApiSuccessResponse, MessageResponse } from '../types/api.types';
import type {
  Todo,
  TodoFilters,
  CreateTodoRequest,
  UpdateTodoRequest,
} from '../types/todo.types';

export async function getTodos(filters?: TodoFilters): Promise<Todo[]> {
  const res = await axiosInstance.get<ApiSuccessResponse<Todo[]>>('/todos', {
    params: filters,
  });
  return res.data.data;
}

export async function getTodoById(id: string): Promise<Todo> {
  const res = await axiosInstance.get<ApiSuccessResponse<Todo>>(`/todos/${id}`);
  return res.data.data;
}

export async function createTodo(payload: CreateTodoRequest): Promise<Todo> {
  const res = await axiosInstance.post<ApiSuccessResponse<Todo>>('/todos', payload);
  return res.data.data;
}

export async function updateTodo(id: string, payload: UpdateTodoRequest): Promise<Todo> {
  const res = await axiosInstance.patch<ApiSuccessResponse<Todo>>(`/todos/${id}`, payload);
  return res.data.data;
}

export async function deleteTodo(id: string): Promise<MessageResponse> {
  const res = await axiosInstance.delete<ApiSuccessResponse<MessageResponse>>(`/todos/${id}`);
  return res.data.data;
}
