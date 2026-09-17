import { apiClient } from './client';
import type { Pipeline, PipelineStage, PipelineMember } from '@/types/api';

export interface PipelineStageInput {
  name: string;
  probability?: number;
  isWon?: boolean;
  isLost?: boolean;
}

export interface CreatePipelineInput {
  name: string;
  stages: PipelineStageInput[];
}

export async function listPipelines(): Promise<Pipeline[]> {
  const { data } = await apiClient.get<Pipeline[]>('/pipelines');
  return data;
}

export async function getPipeline(id: string): Promise<Pipeline> {
  const { data } = await apiClient.get<Pipeline>(`/pipelines/${id}`);
  return data;
}

export async function createPipeline(payload: CreatePipelineInput): Promise<Pipeline> {
  const { data } = await apiClient.post<Pipeline>('/pipelines', payload);
  return data;
}

export async function updatePipeline(
  id: string,
  payload: { name?: string; isDefault?: boolean },
): Promise<Pipeline> {
  const { data } = await apiClient.patch<Pipeline>(`/pipelines/${id}`, payload);
  return data;
}

export async function deletePipeline(id: string): Promise<void> {
  await apiClient.delete(`/pipelines/${id}`);
}

export async function addStage(
  pipelineId: string,
  payload: PipelineStageInput,
): Promise<PipelineStage> {
  const { data } = await apiClient.post<PipelineStage>(
    `/pipelines/${pipelineId}/stages`,
    payload,
  );
  return data;
}

export async function updateStage(
  pipelineId: string,
  stageId: string,
  payload: Partial<PipelineStageInput>,
): Promise<PipelineStage> {
  const { data } = await apiClient.patch<PipelineStage>(
    `/pipelines/${pipelineId}/stages/${stageId}`,
    payload,
  );
  return data;
}

export async function removeStage(pipelineId: string, stageId: string): Promise<void> {
  await apiClient.delete(`/pipelines/${pipelineId}/stages/${stageId}`);
}

export async function reorderStages(
  pipelineId: string,
  stageIds: string[],
): Promise<PipelineStage[]> {
  const { data } = await apiClient.patch<PipelineStage[]>(
    `/pipelines/${pipelineId}/stages/reorder`,
    { stageIds },
  );
  return data;
}

export async function getPipelineMembers(pipelineId: string): Promise<PipelineMember[]> {
  const { data } = await apiClient.get<PipelineMember[]>(`/pipelines/${pipelineId}/members`);
  return data;
}

export async function setPipelineMembers(
  pipelineId: string,
  memberIds: string[],
): Promise<PipelineMember[]> {
  const { data } = await apiClient.put<PipelineMember[]>(`/pipelines/${pipelineId}/members`, {
    memberIds,
  });
  return data;
}
