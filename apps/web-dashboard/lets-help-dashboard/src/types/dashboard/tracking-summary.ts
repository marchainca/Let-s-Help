export interface RatioPercent {
  ratio: number;
  percent: string;
}

export interface ExecutionVsPlanning {
  executed: number;
  planned: number;
  ratio: number;
  percent: string;
}

export interface Coverage {
  actualAttendees: number;
  projectedAttendees: number;
  ratio: number;
  percent: string;
}

export interface ResponsibleCompliance {
  id: number;
  name: string;
  executed: number;
  planned: number;
  actualAttendees: number;
  projectedAttendees: number;
  executionCompliance: RatioPercent;
  coverageCompliance: RatioPercent;
  complianceLevel: RatioPercent;
  responsible: {
    id: number;
    name: string;
  };
}

export interface TrackingSummaryContent {
  tracking: {
    executionVsPlanning: ExecutionVsPlanning;
    coverage: Coverage;
    responsibleCompliance: ResponsibleCompliance[];
  };
}
