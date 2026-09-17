'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createProduct,
  listProducts,
  removeProduct,
  updateProduct,
  type ProductInput,
} from '@/api/products';

const PRODUCTS_KEY = ['products'];

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: () => listProducts(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductInput) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success('Produto criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar produto'),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductInput> }) =>
      updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success('Produto atualizado');
    },
    onError: () => toast.error('Erro ao atualizar produto'),
  });
}

export function useRemoveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success('Produto removido');
    },
    onError: () => toast.error('Erro ao remover produto'),
  });
}
