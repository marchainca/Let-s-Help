export type ActivityMetric = 'attendance' | 'beneficiaries';

export interface ActivityEntity {
  id: number;
  name: string;
}

export interface ActivityHighlight {
  id: number;
  name: string;
  metric: ActivityMetric;
  value: number;
  activity: ActivityEntity;
  program: ActivityEntity;
  subProgram: ActivityEntity;
  responsible: ActivityEntity;
}

export interface ActivitySummaryContent {
  activities: {
    mostAttendance: ActivityHighlight;
    leastAttendance: ActivityHighlight;
    mostBeneficiaries: ActivityHighlight;
  };
}

export type ActivitySummaryKey = keyof ActivitySummaryContent['activities'];
