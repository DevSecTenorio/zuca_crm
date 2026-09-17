'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createCatalogItem,
  listCatalogItems,
  removeCatalogItem,
  reorderCatalogItems,
  updateCatalogItem,
  type CatalogItemInput,
  type CatalogResource,
} from '@/api/catalogs';

export function useCatalogItems(resource: CatalogResource) {
  return useQuery({
    queryKey: ['catalog', resource],
    queryFn: () => listCatalogItems(resource),
  });
}

export function useCreateCatalogItem(resource: CatalogResource) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CatalogItemInput) => createCatalogItem(resource, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', resource] });
      toast.success('Item criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar item'),
  });
}

export function useUpdateCatalogItem(resource: CatalogResource) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CatalogItemInput> }) =>
      updateCatalogItem(resource, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog', resource] }),
    onError: () => toast.error('Erro ao atualizar item'),
  });
}

export function useRemoveCatalogItem(resource: CatalogResource) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeCatalogItem(resource, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', resource] });
      toast.success('Item removido');
    },
    onError: () => toast.error('Erro ao remover item'),
  });
}

export function useReorderCatalogItems(resource: CatalogResource) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderCatalogItems(resource, ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog', resource] }),
    onError: () => toast.error('Erro ao reordenar'),
  });
}
