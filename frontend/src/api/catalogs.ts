import { apiClient } from './client';
import type { CatalogItem } from '@/types/api';

export type CatalogResource = 'lead-sources' | 'campaigns' | 'loss-reasons' | 'segments';

export interface CatalogItemInput {
  name: string;
  active?: boolean;
}

export async function listCatalogItems(resource: CatalogResource): Promise<CatalogItem[]> {
  const { data } = await apiClient.get<CatalogItem[]>(`/${resource}`);
  return data;
}

export async function createCatalogItem(
  resource: CatalogResource,
  payload: CatalogItemInput,
): Promise<CatalogItem> {
  const { data } = await apiClient.post<CatalogItem>(`/${resource}`, payload);
  return data;
}

export async function updateCatalogItem(
  resource: CatalogResource,
  id: string,
  payload: Partial<CatalogItemInput>,
): Promise<CatalogItem> {
  const { data } = await apiClient.patch<CatalogItem>(`/${resource}/${id}`, payload);
  return data;
}

export async function removeCatalogItem(resource: CatalogResource, id: string): Promise<void> {
  await apiClient.delete(`/${resource}/${id}`);
}

export async function reorderCatalogItems(
  resource: CatalogResource,
  ids: string[],
): Promise<CatalogItem[]> {
  const { data } = await apiClient.patch<CatalogItem[]>(`/${resource}/reorder`, { ids });
  return data;
}
