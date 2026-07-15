import apiClient from '@/lib/apiClient';
import params from '@/params';
import { ApiResponse } from '@/types/dashboard/api-response';
import { TrackingSummaryContent } from '@/types/dashboard/tracking-summary';

export async function fetchTrackingSummary(): Promise<TrackingSummaryContent> {
  const { data } = await apiClient.get<ApiResponse<TrackingSummaryContent>>(
    params.paths.trackingSummary
  );

  if (data.code !== 1) {
    throw new Error(data.message);
  }

  return data.content;
}
