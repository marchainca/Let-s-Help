import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchActivitySummary } from '@/services/dashboard/activitySummaryService';

export const ACTIVITY_SUMMARY_QUERY_KEY = ['dashboard', 'activity-summary'] as const;

export function useActivitySummary() {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: [...ACTIVITY_SUMMARY_QUERY_KEY, i18n.language],
    queryFn: fetchActivitySummary,
  });
}
