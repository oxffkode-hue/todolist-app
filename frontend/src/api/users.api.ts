import axiosInstance from './axiosInstance';
import type { ApiSuccessResponse } from '../types/api.types';
import type { UpdateProfileRequest, User } from '../types/user.types';

export async function updateProfile(payload: UpdateProfileRequest): Promise<User> {
  const res = await axiosInstance.patch<ApiSuccessResponse<User>>('/users/me', payload);
  return res.data.data;
}
