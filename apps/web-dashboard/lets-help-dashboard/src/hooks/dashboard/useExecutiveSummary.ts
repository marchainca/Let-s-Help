import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchExecutiveSummary } from '@/services/dashboard/executiveSummaryService';

export const EXECUTIVE_SUMMARY_QUERY_KEY = ['dashboard', 'executive-summary'] as const;

export function useExecutiveSummary() {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: [...EXECUTIVE_SUMMARY_QUERY_KEY, i18n.language],
    queryFn: fetchExecutiveSummary,
  });
}
