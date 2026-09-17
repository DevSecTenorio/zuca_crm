'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  addStage,
  createPipeline,
  deletePipeline,
  getPipeline,
  getPipelineMembers,
  listPipelines,
  removeStage,
  reorderStages,
  setPipelineMembers,
  updatePipeline,
  updateStage,
  type CreatePipelineInput,
  type PipelineStageInput,
} from '@/api/pipelines';

const PIPELINES_KEY = ['pipelines'];

export function usePipelines() {
  return useQuery({
    queryKey: PIPELINES_KEY,
    queryFn: () => listPipelines(),
  });
}

export function usePipeline(id?: string) {
  return useQuery({
    queryKey: [...PIPELINES_KEY, id],
    queryFn: () => getPipeline(id as string),
    enabled: !!id,
  });
}

export function usePipelineMembers(id?: string) {
  return useQuery({
    queryKey: [...PIPELINES_KEY, id, 'members'],
    queryFn: () => getPipelineMembers(id as string),
    enabled: !!id,
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePipelineInput) => createPipeline(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINES_KEY });
      toast.success('Funil criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar funil'),
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; isDefault?: boolean } }) =>
      updatePipeline(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINES_KEY });
      toast.success('Funil atualizado');
    },
    onError: () => toast.error('Erro ao atualizar funil'),
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePipeline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIPELINES_KEY });
      toast.success('Funil removido');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao remover funil';
      toast.error(message);
    },
  });
}

export function useAddStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, payload }: { pipelineId: string; payload: PipelineStageInput }) =>
      addStage(pipelineId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PIPELINES_KEY }),
    onError: () => toast.error('Erro ao adicionar etapa'),
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pipelineId,
      stageId,
      payload,
    }: {
      pipelineId: string;
      stageId: string;
      payload: Partial<PipelineStageInput>;
    }) => updateStage(pipelineId, stageId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PIPELINES_KEY }),
    onError: () => toast.error('Erro ao atualizar etapa'),
  });
}

export function useRemoveStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, stageId }: { pipelineId: string; stageId: string }) =>
      removeStage(pipelineId, stageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PIPELINES_KEY }),
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao remover etapa';
      toast.error(message);
    },
  });
}

export function useReorderStages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, stageIds }: { pipelineId: string; stageIds: string[] }) =>
      reorderStages(pipelineId, stageIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PIPELINES_KEY }),
    onError: () => toast.error('Erro ao reordenar etapas'),
  });
}

export function useSetPipelineMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, memberIds }: { pipelineId: string; memberIds: string[] }) =>
      setPipelineMembers(pipelineId, memberIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...PIPELINES_KEY, variables.pipelineId, 'members'] });
      toast.success('Membros do funil atualizados');
    },
    onError: () => toast.error('Erro ao atualizar membros'),
  });
}
