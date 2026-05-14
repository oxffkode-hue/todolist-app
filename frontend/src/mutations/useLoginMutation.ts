import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth.api';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../constants';
import type { LoginRequest } from '../types/user.types';

export function useLoginMutation() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user);
      navigate(ROUTES.HOME);
    },
  });
}
