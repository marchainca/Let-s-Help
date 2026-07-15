export type ExecutiveMetricTable =
  | 'Beneficiaries'
  | 'Programs'
  | 'Sub_Programs'
  | 'Activities'
  | 'Attendances'
  | 'Absences'
  | 'Reports'
  | 'Users';

export interface ExecutiveMetric {
  indicator: string;
  table: ExecutiveMetricTable;
  value: number;
}

export interface ExecutiveSummaryContent {
  metrics: ExecutiveMetric[];
}
