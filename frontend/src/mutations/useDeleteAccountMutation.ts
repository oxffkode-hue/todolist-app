import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../api/auth.api';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../constants';
import type { DeleteAccountRequest } from '../types/user.types';

export function useDeleteAccountMutation() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: (payload: DeleteAccountRequest) => deleteAccount(payload),
    onSuccess: () => {
      clearAuth();
      navigate(ROUTES.LOGIN);
    },
  });
}
