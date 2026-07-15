import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchSubProgramSummary } from '@/services/dashboard/subProgramSummaryService';

export const SUB_PROGRAM_SUMMARY_QUERY_KEY = ['dashboard', 'subprogram-summary'] as const;

export function useSubProgramSummary() {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: [...SUB_PROGRAM_SUMMARY_QUERY_KEY, i18n.language],
    queryFn: fetchSubProgramSummary,
  });
}
