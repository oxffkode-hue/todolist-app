import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/auth.api';
import { ROUTES } from '../constants';
import type { SignupRequest } from '../types/user.types';

export function useSignupMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: SignupRequest) => signup(payload),
    onSuccess: () => {
      navigate(ROUTES.LOGIN);
    },
  });
}
