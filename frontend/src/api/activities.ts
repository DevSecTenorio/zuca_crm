import { apiClient } from './client';
import type { Activity, ActivityType } from '@/types/api';

export interface ActivityInput {
  type: ActivityType;
  title?: string;
  description?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  durationMinutes?: number;
  assignedTo?: string;
  dueAt?: string;
}

export interface AgendaFilters {
  from?: string;
  to?: string;
  assignedTo?: string;
  includeCompleted?: boolean;
}

export async function createActivity(payload: ActivityInput): Promise<Activity> {
  const { data } = await apiClient.post<Activity>('/activities', payload);
  return data;
}

export async function listRecentActivities(limit = 20): Promise<Activity[]> {
  const { data } = await apiClient.get<Activity[]>('/activities', { params: { limit } });
  return data;
}

export async function listContactActivities(contactId: string): Promise<Activity[]> {
  const { data } = await apiClient.get<Activity[]>(`/activities/contact/${contactId}`);
  return data;
}

export async function listDealActivities(dealId: string): Promise<Activity[]> {
  const { data } = await apiClient.get<Activity[]>(`/activities/deal/${dealId}`);
  return data;
}

export async function listAgenda(filters: AgendaFilters): Promise<Activity[]> {
  const { data } = await apiClient.get<Activity[]>('/activities/agenda', {
    params: {
      from: filters.from,
      to: filters.to,
      assignedTo: filters.assignedTo,
      includeCompleted: filters.includeCompleted ? 'true' : undefined,
    },
  });
  return data;
}

export async function updateActivity(
  id: string,
  payload: Partial<ActivityInput> & { completedAt?: string },
): Promise<Activity> {
  const { data } = await apiClient.patch<Activity>(`/activities/${id}`, payload);
  return data;
}

export async function deleteActivity(id: string): Promise<void> {
  await apiClient.delete(`/activities/${id}`);
}
