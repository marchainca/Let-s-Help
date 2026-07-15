import apiClient from '@/lib/apiClient';
import params from '@/params';
import { ApiResponse } from '@/types/dashboard/api-response';
import { ProgramSummaryContent } from '@/types/dashboard/program-summary';

export async function fetchProgramSummary(): Promise<ProgramSummaryContent> {
  const { data } = await apiClient.get<ApiResponse<ProgramSummaryContent>>(
    params.paths.programSummary
  );

  if (data.code !== 1) {
    throw new Error(data.message);
  }

  return data.content;
}
