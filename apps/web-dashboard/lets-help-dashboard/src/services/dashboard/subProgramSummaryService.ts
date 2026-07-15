import apiClient from '@/lib/apiClient';
import params from '@/params';
import { ApiResponse } from '@/types/dashboard/api-response';
import { SubProgramSummaryContent } from '@/types/dashboard/subprogram-summary';

export async function fetchSubProgramSummary(): Promise<SubProgramSummaryContent> {
  const { data } = await apiClient.get<ApiResponse<SubProgramSummaryContent>>(
    params.paths.subProgramSummary
  );

  if (data.code !== 1) {
    throw new Error(data.message);
  }

  return data.content;
}
