export interface User {
  id: string;
  email: string;
  name: string;
  darkMode: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignupResponse {
  id: string;
  email: string;
  name: string;
}

export interface UpdateProfileRequest {
  name?: string;
  currentPassword?: string;
  password?: string;
  darkMode?: boolean;
  language?: string;
}

export interface DeleteAccountRequest {
  password: string;
}
