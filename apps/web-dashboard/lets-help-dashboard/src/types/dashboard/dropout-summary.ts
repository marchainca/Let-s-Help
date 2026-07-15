export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface DropoutEntity {
  id: number;
  name: string;
}

export interface DropoutPeriodCount {
  count: number;
}

export interface DropoutSummaryPeriods {
  '15days': DropoutPeriodCount;
  '30days': DropoutPeriodCount;
  '60days': DropoutPeriodCount;
  '90days': DropoutPeriodCount;
}

export interface RiskIndicators {
  totalAtRisk: number;
  neverAttended: number;
  escalatingRisk: number;
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

export interface DropoutBeneficiary {
  id: number;
  name: string;
  identification: string;
  beneficiary: {
    id: number;
    name: string;
    identification: string;
  };
  lastPresentDate: string | null;
  daysSinceLastAttendance: number | null;
  neverAttended: boolean;
  totalPresent: number;
  totalAbsent: number;
  totalJustified: number;
  recentAbsences: number;
  absenceRate: number;
  absencePercent: string;
  riskLevel: RiskLevel;
  abandonmentRisk: {
    score: number;
    level: RiskLevel;
    factors: string[];
  };
  lastActivity: DropoutEntity | null;
  program: DropoutEntity | null;
  subProgram: DropoutEntity | null;
}

export interface DropoutPeriodDetail {
  days: number;
  count: number;
  beneficiaries: DropoutBeneficiary[];
}

export type DropoutPeriodKey = '15days' | '30days' | '60days' | '90days';

export interface DropoutByPeriod {
  '15days': DropoutPeriodDetail;
  '30days': DropoutPeriodDetail;
  '60days': DropoutPeriodDetail;
  '90days': DropoutPeriodDetail;
}

export interface DropoutSummaryContent {
  dropout: {
    summary: DropoutSummaryPeriods;
    riskIndicators: RiskIndicators;
    earlyWarnings: unknown[];
    byPeriod: DropoutByPeriod;
  };
}
