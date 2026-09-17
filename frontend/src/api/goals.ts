import { apiClient } from './client';
import type { SalesGoalEntry } from '@/types/api';

export interface UpsertGoalPayload {
  userId: string;
  year: number;
  month: number;
  targetValue: number;
  targetCount: number;
}

export async function listGoals(year: number, month: number): Promise<SalesGoalEntry[]> {
  const { data } = await apiClient.get<SalesGoalEntry[]>('/goals', { params: { year, month } });
  return data;
}

export async function upsertGoal(payload: UpsertGoalPayload): Promise<void> {
  await apiClient.put('/goals', payload);
}
