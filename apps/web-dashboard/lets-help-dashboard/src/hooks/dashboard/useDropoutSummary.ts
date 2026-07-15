import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchDropoutSummary } from '@/services/dashboard/dropoutSummaryService';

export const DROPOUT_SUMMARY_QUERY_KEY = ['dashboard', 'dropout-summary'] as const;

export function useDropoutSummary() {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: [...DROPOUT_SUMMARY_QUERY_KEY, i18n.language],
    queryFn: fetchDropoutSummary,
  });
}
