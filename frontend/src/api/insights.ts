import { apiClient } from './client';
import type { GoalsProgress, ProspectingData, RepsKpiData } from '@/types/api';

export async function getGoalsProgress(
  year: number,
  month: number,
  pipelineId?: string,
): Promise<GoalsProgress> {
  const { data } = await apiClient.get<GoalsProgress>('/dashboard/goals-progress', {
    params: { year, month, pipelineId },
  });
  return data;
}

export async function getRepsKpis(
  from: string,
  to: string,
  pipelineId?: string,
): Promise<RepsKpiData> {
  const { data } = await apiClient.get<RepsKpiData>('/dashboard/reps-kpis', {
    params: { from, to, pipelineId },
  });
  return data;
}

export async function getProspecting(
  from: string,
  to: string,
  pipelineId?: string,
): Promise<ProspectingData> {
  const { data } = await apiClient.get<ProspectingData>('/dashboard/prospecting', {
    params: { from, to, pipelineId },
  });
  return data;
}
