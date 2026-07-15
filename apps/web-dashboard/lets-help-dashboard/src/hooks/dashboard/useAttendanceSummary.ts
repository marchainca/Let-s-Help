import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchAttendanceSummary } from '@/services/dashboard/attendanceSummaryService';

export const ATTENDANCE_SUMMARY_QUERY_KEY = ['dashboard', 'attendance-summary'] as const;

export function useAttendanceSummary() {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: [...ATTENDANCE_SUMMARY_QUERY_KEY, i18n.language],
    queryFn: fetchAttendanceSummary,
  });
}
