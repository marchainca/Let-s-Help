import apiClient from '@/lib/apiClient';
import params from '@/params';
import { ApiResponse } from '@/types/dashboard/api-response';
import { ExecutiveSummaryContent } from '@/types/dashboard/executive-summary';

export async function fetchExecutiveSummary(): Promise<ExecutiveSummaryContent> {
  const { data } = await apiClient.get<ApiResponse<ExecutiveSummaryContent>>(
    params.paths.executiveSummary
  );

  if (data.code !== 1) {
    throw new Error(data.message);
  }

  return data.content;
}
