'use client';

import { useQuery } from '@tanstack/react-query';
import { listAuditLogs, type AuditLogFilters } from '@/api/audit-logs';

export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => listAuditLogs(filters),
  });
}
