import { apiClient } from './client';
import type { Deal, PipelineSummary } from '@/types/api';

export interface DealInput {
  title: string;
  description?: string;
  value?: number;
  pipelineId: string;
  stageId?: string;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  expectedCloseDate?: string;
  productIds?: string[];
}

export async function listDeals(pipelineId?: string, ownerId?: string): Promise<Deal[]> {
  const { data } = await apiClient.get<Deal[]>('/deals', { params: { pipelineId, ownerId } });
  return data;
}

export async function getDealsSummary(pipelineId: string): Promise<PipelineSummary> {
  const { data } = await apiClient.get<PipelineSummary>('/deals/summary', {
    params: { pipelineId },
  });
  return data;
}

export async function getDeal(id: string): Promise<Deal> {
  const { data } = await apiClient.get<Deal>(`/deals/${id}`);
  return data;
}

export async function createDeal(payload: DealInput): Promise<Deal> {
  const { data } = await apiClient.post<Deal>('/deals', payload);
  return data;
}

export async function updateDeal(
  id: string,
  payload: Partial<Omit<DealInput, 'pipelineId' | 'stageId'>>,
): Promise<Deal> {
  const { data } = await apiClient.patch<Deal>(`/deals/${id}`, payload);
  return data;
}

export async function changeDealStage(
  id: string,
  stageId: string,
  lossReasonId?: string,
): Promise<Deal> {
  const { data } = await apiClient.patch<Deal>(`/deals/${id}/stage`, { stageId, lossReasonId });
  return data;
}

export async function deleteDeal(id: string): Promise<void> {
  await apiClient.delete(`/deals/${id}`);
}
