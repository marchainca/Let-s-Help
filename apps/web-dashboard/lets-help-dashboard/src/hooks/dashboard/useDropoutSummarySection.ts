import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import DangerousIcon from '@mui/icons-material/Dangerous';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { SvgIconComponent } from '@mui/icons-material';
import {
  DropoutBeneficiary,
  DropoutPeriodKey,
  RiskIndicators,
  RiskLevel,
} from '@/types/dashboard/dropout-summary';
import { useDropoutSummary } from './useDropoutSummary';
import { formatDropoutDate } from './dropoutUtils';

export interface DropoutKpiItem {
  id: string;
  title: string;
  tooltip: string;
  value: number;
  icon: SvgIconComponent;
  color: string;
}

export interface DropoutPeriodCardItem {
  id: DropoutPeriodKey;
  title: string;
  tooltip: string;
  count: number;
  icon: SvgIconComponent;
  color: string;
}

export interface AtRiskBeneficiaryRow {
  id: number;
  name: string;
  identification: string;
  program: string;
  subProgram: string;
  lastAttendance: string;
  daysSinceLastAttendance: string;
  totalPresent: number;
  totalAbsent: number;
  totalJustified: number;
  absencePercent: string;
  riskLevel: RiskLevel;
  score: number;
  factors: string;
  lastActivity: string;
}

const RISK_KPI_CONFIG: Array<{
  id: string;
  field: keyof RiskIndicators;
  i18nKey: string;
  icon: SvgIconComponent;
  color: string;
}> = [
  { id: 'totalAtRisk', field: 'totalAtRisk', i18nKey: 'totalAtRisk', icon: WarningAmberIcon, color: '#FF5722' },
  { id: 'neverAttended', field: 'neverAttended', i18nKey: 'neverAttended', icon: PersonOffIcon, color: '#9C27B0' },
  { id: 'criticalRisk', field: 'criticalRisk', i18nKey: 'criticalRisk', icon: DangerousIcon, color: '#F44336' },
  { id: 'highRisk', field: 'highRisk', i18nKey: 'highRisk', icon: ErrorOutlineIcon, color: '#FF9800' },
  { id: 'mediumRisk', field: 'mediumRisk', i18nKey: 'mediumRisk', icon: ReportProblemIcon, color: '#FFC107' },
  { id: 'lowRisk', field: 'lowRisk', i18nKey: 'lowRisk', icon: CheckCircleIcon, color: '#4CAF50' },
];

const PERIOD_ORDER: DropoutPeriodKey[] = ['15days', '30days', '60days', '90days'];

const PERIOD_COLORS: Record<DropoutPeriodKey, string> = {
  '15days': '#F44336',
  '30days': '#FF9800',
  '60days': '#FFC107',
  '90days': '#29ABE2',
};

function mapBeneficiaryToRow(
  beneficiary: DropoutBeneficiary,
  locale: string,
  emptyLabel: string
): AtRiskBeneficiaryRow {
  return {
    id: beneficiary.id,
    name: beneficiary.beneficiary?.name ?? beneficiary.name,
    identification: beneficiary.beneficiary?.identification ?? beneficiary.identification,
    program: beneficiary.program?.name ?? emptyLabel,
    subProgram: beneficiary.subProgram?.name ?? emptyLabel,
    lastAttendance: formatDropoutDate(beneficiary.lastPresentDate, locale),
    daysSinceLastAttendance:
      beneficiary.daysSinceLastAttendance !== null
        ? String(beneficiary.daysSinceLastAttendance)
        : '—',
    totalPresent: beneficiary.totalPresent,
    totalAbsent: beneficiary.totalAbsent,
    totalJustified: beneficiary.totalJustified,
    absencePercent: beneficiary.absencePercent,
    riskLevel: beneficiary.riskLevel,
    score: beneficiary.abandonmentRisk.score,
    factors: beneficiary.abandonmentRisk.factors.join(', '),
    lastActivity: beneficiary.lastActivity?.name ?? emptyLabel,
  };
}

export function useDropoutSummarySection() {
  const { t, i18n } = useTranslation();
  const query = useDropoutSummary();
  const emptyLabel = t('dashboard.common.empty');

  const riskKpis = useMemo<DropoutKpiItem[]>(() => {
    const indicators = query.data?.dropout.riskIndicators;
    if (!indicators) return [];

    return RISK_KPI_CONFIG.map((config) => ({
      id: config.id,
      title: t(`dashboard.dropoutSummary.riskKpis.${config.i18nKey}.title`),
      tooltip: t(`dashboard.dropoutSummary.riskKpis.${config.i18nKey}.tooltip`),
      value: indicators[config.field] ?? 0,
      icon: config.icon,
      color: config.color,
    }));
  }, [query.data, t]);

  const periodCards = useMemo<DropoutPeriodCardItem[]>(() => {
    const summary = query.data?.dropout.summary;
    if (!summary) return [];

    return PERIOD_ORDER.map((periodKey) => ({
      id: periodKey,
      title: t(`dashboard.dropoutSummary.periods.${periodKey}`),
      tooltip: t(`dashboard.dropoutSummary.periods.${periodKey}Tooltip`),
      count: summary[periodKey]?.count ?? 0,
      icon: CalendarTodayIcon,
      color: PERIOD_COLORS[periodKey],
    }));
  }, [query.data, t]);

  const beneficiaries = useMemo<AtRiskBeneficiaryRow[]>(() => {
    const list = query.data?.dropout.byPeriod?.['15days']?.beneficiaries ?? [];
    return list.map((item) => mapBeneficiaryToRow(item, i18n.language, emptyLabel));
  }, [query.data, i18n.language, emptyLabel]);

  const filterOptions = useMemo(() => {
    const riskLevels = new Set<RiskLevel>();
    const programs = new Set<string>();
    const subPrograms = new Set<string>();

    beneficiaries.forEach((row) => {
      riskLevels.add(row.riskLevel);
      if (row.program !== emptyLabel) programs.add(row.program);
      if (row.subProgram !== emptyLabel) subPrograms.add(row.subProgram);
    });

    return {
      riskLevels: Array.from(riskLevels),
      programs: Array.from(programs).sort(),
      subPrograms: Array.from(subPrograms).sort(),
    };
  }, [beneficiaries, emptyLabel]);

  return {
    riskKpis,
    periodCards,
    beneficiaries,
    filterOptions,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: (query.error as Error | undefined)?.message,
    refetch: query.refetch,
  };
}
