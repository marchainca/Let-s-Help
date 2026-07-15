import apiClient from '@/lib/apiClient';
import params from '@/params';
import { ApiResponse } from '@/types/dashboard/api-response';
import { DropoutSummaryContent } from '@/types/dashboard/dropout-summary';

export async function fetchDropoutSummary(): Promise<DropoutSummaryContent> {
  const { data } = await apiClient.get<ApiResponse<DropoutSummaryContent>>(
    params.paths.dropoutSummary
  );

  if (data.code !== 1) {
    throw new Error(data.message);
  }

  return data.content;
}
