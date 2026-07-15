export type ProgramMetric = 'attendance' | 'activities' | 'beneficiaries';

export interface ProgramHighlight {
  id: number;
  name: string;
  metric: ProgramMetric;
  value: number;
  program: {
    id: number;
    name: string;
  };
}

export interface ProgramSummaryContent {
  programs: {
    mostAttendance: ProgramHighlight;
    leastAttendance: ProgramHighlight;
    mostActivities: ProgramHighlight;
    mostBeneficiaries: ProgramHighlight;
  };
}

export type ProgramSummaryKey = keyof ProgramSummaryContent['programs'];
