import { apiClient } from './client';
import type { DashboardData } from '@/types/api';

export async function getDashboard(pipelineId?: string): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>('/dashboard', {
    params: pipelineId ? { pipelineId } : undefined,
  });
  return data;
}
