import { useMutation } from '@tanstack/react-query';
import { updateProfile } from '../api/users.api';
import { useAuthStore } from '../stores/authStore';
import type { UpdateProfileRequest } from '../types/user.types';

export function useUpdateProfileMutation() {
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
    },
  });
}
