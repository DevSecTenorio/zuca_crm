'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listGoals, upsertGoal, type UpsertGoalPayload } from '@/api/goals';

export function useGoals(year: number, month: number) {
  return useQuery({
    queryKey: ['goals', year, month],
    queryFn: () => listGoals(year, month),
  });
}

export function useUpsertGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertGoalPayload) => upsertGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['insights', 'goals-progress'] });
      toast.success('Meta salva');
    },
    onError: () => toast.error('Erro ao salvar meta'),
  });
}
