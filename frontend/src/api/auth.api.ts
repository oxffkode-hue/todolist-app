import axiosInstance from './axiosInstance';
import type { ApiSuccessResponse, MessageResponse } from '../types/api.types';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  DeleteAccountRequest,
} from '../types/user.types';

export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const res = await axiosInstance.post<ApiSuccessResponse<SignupResponse>>(
    '/auth/signup',
    payload,
  );
  return res.data.data;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await axiosInstance.post<ApiSuccessResponse<LoginResponse>>(
    '/auth/login',
    payload,
  );
  return res.data.data;
}

export async function logout(): Promise<MessageResponse> {
  const res = await axiosInstance.post<ApiSuccessResponse<MessageResponse>>('/auth/logout');
  return res.data.data;
}

export async function deleteAccount(payload: DeleteAccountRequest): Promise<MessageResponse> {
  const res = await axiosInstance.delete<ApiSuccessResponse<MessageResponse>>('/auth/account', {
    data: payload,
  });
  return res.data.data;
}
