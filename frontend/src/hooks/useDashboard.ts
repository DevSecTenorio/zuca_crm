'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/api/dashboard';

export function useDashboard(pipelineId?: string) {
  return useQuery({
    queryKey: ['dashboard', pipelineId ?? ''],
    queryFn: () => getDashboard(pipelineId),
  });
}
