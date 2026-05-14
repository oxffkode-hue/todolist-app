import { useMutation } from '@tanstack/react-query';
import { updateProfile } from '../api/users.api';
import { useAuthStore } from '../stores/authStore';

export function useToggleLanguageMutation() {
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (language: string) => updateProfile({ language }),
    onSuccess: (updatedUser) => {
      updateUser({ language: updatedUser.language });
    },
  });
}
