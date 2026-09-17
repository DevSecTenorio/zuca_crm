'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  changeDealStage,
  createDeal,
  deleteDeal,
  getDeal,
  getDealsSummary,
  listDeals,
  updateDeal,
  type DealInput,
} from '@/api/deals';
import type { Deal } from '@/types/api';

const DEALS_KEY = ['deals'];
const DEALS_SUMMARY_KEY = ['deals', 'summary'];

export function useDeals(pipelineId?: string, ownerId?: string) {
  return useQuery({
    queryKey: [...DEALS_KEY, pipelineId ?? '', ownerId ?? ''],
    queryFn: () => listDeals(pipelineId as string, ownerId),
    enabled: !!pipelineId,
  });
}

export function useAllDeals() {
  return useQuery({
    queryKey: [...DEALS_KEY, 'all'],
    queryFn: () => listDeals(),
  });
}

export function useDeal(id?: string) {
  return useQuery({
    queryKey: [...DEALS_KEY, id],
    queryFn: () => getDeal(id as string),
    enabled: !!id,
  });
}

export function useDealsSummary(pipelineId?: string) {
  return useQuery({
    queryKey: [...DEALS_SUMMARY_KEY, pipelineId ?? ''],
    queryFn: () => getDealsSummary(pipelineId as string),
    enabled: !!pipelineId,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DealInput) => createDeal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEALS_KEY });
      queryClient.invalidateQueries({ queryKey: DEALS_SUMMARY_KEY });
      toast.success('Deal criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar deal'),
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<DealInput, 'pipelineId' | 'stageId'>> }) =>
      updateDeal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEALS_KEY });
      queryClient.invalidateQueries({ queryKey: DEALS_SUMMARY_KEY });
    },
    onError: () => toast.error('Erro ao atualizar deal'),
  });
}

export function useChangeDealStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stageId, lossReasonId }: { id: string; stageId: string; lossReasonId?: string }) =>
      changeDealStage(id, stageId, lossReasonId),
    onMutate: async ({ id, stageId }) => {
      await queryClient.cancelQueries({ queryKey: DEALS_KEY });
      const previous = queryClient.getQueriesData<Deal[]>({ queryKey: DEALS_KEY });
      queryClient.setQueriesData<Deal[]>({ queryKey: DEALS_KEY }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((deal) => (deal.id === id ? { ...deal, stageId } : deal));
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      toast.error('Erro ao mover deal');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DEALS_KEY });
      queryClient.invalidateQueries({ queryKey: DEALS_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEALS_KEY });
      queryClient.invalidateQueries({ queryKey: DEALS_SUMMARY_KEY });
      toast.success('Deal removido');
    },
    onError: () => toast.error('Erro ao remover deal'),
  });
}
