export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  status: 'error';
  code: string;
  message: string;
  timestamp: string;
}

export interface MessageResponse {
  message: string;
}
