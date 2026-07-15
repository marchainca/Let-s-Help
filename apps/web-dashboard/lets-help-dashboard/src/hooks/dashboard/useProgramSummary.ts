import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchProgramSummary } from '@/services/dashboard/programSummaryService';

export const PROGRAM_SUMMARY_QUERY_KEY = ['dashboard', 'program-summary'] as const;

export function useProgramSummary() {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: [...PROGRAM_SUMMARY_QUERY_KEY, i18n.language],
    queryFn: fetchProgramSummary,
  });
}
