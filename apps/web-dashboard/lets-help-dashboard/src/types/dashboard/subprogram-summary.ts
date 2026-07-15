export type SubProgramMetric = 'attendance' | 'activities' | 'beneficiaries';

export interface SubProgramHighlight {
  id: number;
  name: string;
  metric: SubProgramMetric;
  value: number;
  subProgram: {
    id: number;
    name: string;
  };
}

export interface SubProgramSummaryContent {
  subPrograms: {
    mostAttendance: SubProgramHighlight;
    leastAttendance: SubProgramHighlight;
    mostActivities: SubProgramHighlight;
    mostBeneficiaries: SubProgramHighlight;
  };
}

export type SubProgramSummaryKey = keyof SubProgramSummaryContent['subPrograms'];
