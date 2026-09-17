'use client';

import { useQuery } from '@tanstack/react-query';
import { getGoalsProgress, getProspecting, getRepsKpis } from '@/api/insights';

export function useGoalsProgress(year: number, month: number, pipelineId?: string) {
  return useQuery({
    queryKey: ['insights', 'goals-progress', year, month, pipelineId],
    queryFn: () => getGoalsProgress(year, month, pipelineId),
  });
}

export function useRepsKpis(from: string, to: string, pipelineId?: string) {
  return useQuery({
    queryKey: ['insights', 'reps-kpis', from, to, pipelineId],
    queryFn: () => getRepsKpis(from, to, pipelineId),
  });
}

export function useProspecting(from: string, to: string, pipelineId?: string) {
  return useQuery({
    queryKey: ['insights', 'prospecting', from, to, pipelineId],
    queryFn: () => getProspecting(from, to, pipelineId),
  });
}
