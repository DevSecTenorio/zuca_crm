'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createContact,
  deleteContact,
  getContact,
  listContacts,
  updateContact,
  type ContactInput,
} from '@/api/contacts';

const CONTACTS_KEY = ['contacts'];

export function useContacts(search?: string) {
  return useQuery({
    queryKey: [...CONTACTS_KEY, search ?? ''],
    queryFn: () => listContacts(search),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: [...CONTACTS_KEY, id],
    queryFn: () => getContact(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContactInput) => createContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
      toast.success('Contato criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar contato'),
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ContactInput> }) =>
      updateContact(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
      toast.success('Contato atualizado');
    },
    onError: () => toast.error('Erro ao atualizar contato'),
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_KEY });
      toast.success('Contato removido');
    },
    onError: () => toast.error('Erro ao remover contato'),
  });
}
