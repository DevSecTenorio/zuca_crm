'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createActivity,
  deleteActivity,
  listAgenda,
  listContactActivities,
  listDealActivities,
  listRecentActivities,
  updateActivity,
  type ActivityInput,
  type AgendaFilters,
} from '@/api/activities';

export function useRecentActivities(limit = 20) {
  return useQuery({
    queryKey: ['activities', 'recent', limit],
    queryFn: () => listRecentActivities(limit),
  });
}

export function useContactActivities(contactId: string) {
  return useQuery({
    queryKey: ['activities', 'contact', contactId],
    queryFn: () => listContactActivities(contactId),
    enabled: !!contactId,
  });
}

export function useDealActivities(dealId: string) {
  return useQuery({
    queryKey: ['activities', 'deal', dealId],
    queryFn: () => listDealActivities(dealId),
    enabled: !!dealId,
  });
}

export function useAgenda(filters: AgendaFilters) {
  return useQuery({
    queryKey: ['activities', 'agenda', filters],
    queryFn: () => listAgenda(filters),
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActivityInput) => createActivity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Atividade registrada');
    },
    onError: () => toast.error('Erro ao registrar atividade'),
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ActivityInput> & { completedAt?: string };
    }) => updateActivity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: () => toast.error('Erro ao atualizar atividade'),
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Item removido');
    },
    onError: () => toast.error('Erro ao remover'),
  });
}
