import { apiClient } from './client';
import type { Deal } from '@/types/api';

export interface DealsReportFilters {
  from: string;
  to: string;
  pipelineId?: string;
}

export async function getDealsReport(filters: DealsReportFilters): Promise<Deal[]> {
  const { data } = await apiClient.get<Deal[]>('/dashboard/report', { params: filters });
  return data;
}
