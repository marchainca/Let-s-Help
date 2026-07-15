import apiClient from '@/lib/apiClient';
import params from '@/params';
import { ApiResponse } from '@/types/dashboard/api-response';
import { ActivitySummaryContent } from '@/types/dashboard/activity-summary';

export async function fetchActivitySummary(): Promise<ActivitySummaryContent> {
  const { data } = await apiClient.get<ApiResponse<ActivitySummaryContent>>(
    params.paths.activitySummary
  );

  if (data.code !== 1) {
    throw new Error(data.message);
  }

  return data.content;
}
