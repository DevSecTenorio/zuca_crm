'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { changeOwnPassword, getOwnProfile, updateOwnProfile } from '@/api/users';
import { useAuthStore } from '@/store/auth-store';

export function useOwnProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => getOwnProfile(),
  });
}

export function useUpdateOwnProfile() {
  const patchUser = useAuthStore((s) => s.patchUser);
  return useMutation({
    mutationFn: (name: string) => updateOwnProfile(name),
    onSuccess: (data) => {
      patchUser({ name: data.name });
      toast.success('Perfil atualizado');
    },
    onError: () => toast.error('Erro ao atualizar perfil'),
  });
}

export function useChangeOwnPassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changeOwnPassword(currentPassword, newPassword),
    onSuccess: () => toast.success('Senha alterada com sucesso'),
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao alterar senha';
      toast.error(message);
    },
  });
}
