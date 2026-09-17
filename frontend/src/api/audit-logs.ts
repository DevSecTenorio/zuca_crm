import { apiClient } from './client';
import type { AuditLog } from '@/types/api';

export interface AuditLogFilters {
  from?: string;
  to?: string;
  action?: string;
  limit?: number;
}

export async function listAuditLogs(filters: AuditLogFilters): Promise<AuditLog[]> {
  const { data } = await apiClient.get<AuditLog[]>('/audit-logs', { params: filters });
  return data;
}
