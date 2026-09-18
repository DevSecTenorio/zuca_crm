'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  changeUserPassword,
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/api/users';

const USERS_KEY = ['users'];

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => listUsers(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserInput) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('Usuário criado com sucesso');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao criar usuário';
      toast.error(message);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserInput }) =>
      updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('Usuário atualizado');
    },
    onError: () => toast.error('Erro ao atualizar usuário'),
  });
}

export function useChangeUserPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      changeUserPassword(id, newPassword),
    onSuccess: () => toast.success('Senha alterada com sucesso'),
    onError: () => toast.error('Erro ao alterar senha'),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('Usuário removido');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao remover usuário';
      toast.error(message);
    },
  });
}
