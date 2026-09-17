'use client';

import { useQuery } from '@tanstack/react-query';
import { getDealsReport, type DealsReportFilters } from '@/api/reports';

export function useDealsReport(filters: DealsReportFilters | null) {
  return useQuery({
    queryKey: ['reports', 'deals', filters],
    queryFn: () => getDealsReport(filters as DealsReportFilters),
    enabled: !!filters,
  });
}
