import apiClient from '@/lib/apiClient';
import params from '@/params';
import { ApiResponse } from '@/types/dashboard/api-response';
import { AttendanceSummaryContent } from '@/types/dashboard/attendance-summary';

export async function fetchAttendanceSummary(): Promise<AttendanceSummaryContent> {
  const { data } = await apiClient.get<ApiResponse<AttendanceSummaryContent>>(
    params.paths.attendanceSummary
  );

  if (data.code !== 1) {
    throw new Error(data.message);
  }

  return data.content;
}
