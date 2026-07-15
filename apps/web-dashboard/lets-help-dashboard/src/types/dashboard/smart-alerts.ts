export type SmartAlertSeverity = 'critical' | 'warning' | 'info';

export type SmartAlertSource =
  | 'attendance-summary'
  | 'activity-summary'
  | 'tracking-summary'
  | 'dropout-summary';

export interface SmartAlert {
  id: string;
  severity: SmartAlertSeverity;
  categoryKey: string;
  title: string;
  description: string;
  source: SmartAlertSource;
}

export const COVERAGE_THRESHOLD = 0.8;
export const COMPLIANCE_THRESHOLD = 0.7;
