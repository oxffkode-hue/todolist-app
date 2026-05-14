import { useMutation } from '@tanstack/react-query';
import { updateProfile } from '../api/users.api';
import { useAuthStore } from '../stores/authStore';

export function useToggleDarkModeMutation() {
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (darkMode: boolean) => updateProfile({ darkMode }),
    onSuccess: (updatedUser) => {
      updateUser({ darkMode: updatedUser.darkMode });
    },
  });
}
