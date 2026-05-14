import axios from 'axios';

export function getErrorCode(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    return (error.response?.data?.code as string | undefined) ?? null;
  }
  return null;
}

export function getErrorMessage(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    return (error.response?.data?.message as string | undefined) ?? null;
  }
  return null;
}
