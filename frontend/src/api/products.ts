import { apiClient } from './client';
import type { Product } from '@/types/api';

export interface ProductInput {
  name: string;
  description?: string;
  price?: number;
  sku?: string;
  active?: boolean;
}

export async function listProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>('/products');
  return data;
}

export async function createProduct(payload: ProductInput): Promise<Product> {
  const { data } = await apiClient.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(
  id: string,
  payload: Partial<ProductInput>,
): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function removeProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
