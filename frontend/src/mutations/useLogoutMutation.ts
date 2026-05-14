import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth.api';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../constants';

export function useLogoutMutation() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      clearAuth();
      navigate(ROUTES.LOGIN);
    },
  });
}
