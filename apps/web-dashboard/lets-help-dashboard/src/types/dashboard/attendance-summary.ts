export interface AttendancePeriodCounts {
  day: number;
  week: number;
  month: number;
  year: number;
  beneficiariesPresent: number;
  absences: number;
  justified: number;
}

export interface KpiCountPercent {
  count: number;
  percent: string;
}

export interface RankedEntity {
  id: number;
  name: string;
  count: number;
  percent: string;
  entity: {
    id: number;
    name: string;
  };
}

export interface AttendanceKpis {
  effectiveAttendance: KpiCountPercent;
  absences: KpiCountPercent;
  justifiedAbsences: KpiCountPercent;
  topProgramsByAttendance: RankedEntity[];
  topProgramsByAbsence: RankedEntity[];
  topSubProgramsByAttendance: RankedEntity[];
  topSubProgramsByAbsence: RankedEntity[];
  topActivitiesByAttendance: RankedEntity[];
  topActivitiesByAbsence: RankedEntity[];
}

export interface AttendanceSummaryContent {
  attendance: AttendancePeriodCounts;
  kpis: AttendanceKpis;
}
