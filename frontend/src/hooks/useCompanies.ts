'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createCompany,
  deleteCompany,
  getCompany,
  listCompanies,
  updateCompany,
  type CompanyInput,
} from '@/api/companies';

const COMPANIES_KEY = ['companies'];

export function useCompanies(search?: string) {
  return useQuery({
    queryKey: [...COMPANIES_KEY, search ?? ''],
    queryFn: () => listCompanies(search),
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: [...COMPANIES_KEY, id],
    queryFn: () => getCompany(id),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyInput) => createCompany(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      toast.success('Empresa criada com sucesso');
    },
    onError: () => toast.error('Erro ao criar empresa'),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CompanyInput> }) =>
      updateCompany(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      toast.success('Empresa atualizada');
    },
    onError: () => toast.error('Erro ao atualizar empresa'),
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      toast.success('Empresa removida');
    },
    onError: () => toast.error('Erro ao remover empresa'),
  });
}
