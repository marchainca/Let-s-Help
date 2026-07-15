import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchTrackingSummary } from '@/services/dashboard/trackingSummaryService';

export const TRACKING_SUMMARY_QUERY_KEY = ['dashboard', 'tracking-summary'] as const;

export function useTrackingSummary() {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: [...TRACKING_SUMMARY_QUERY_KEY, i18n.language],
    queryFn: fetchTrackingSummary,
  });
}
