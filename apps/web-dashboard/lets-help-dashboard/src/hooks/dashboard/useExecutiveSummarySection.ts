import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import VerifiedIcon from '@mui/icons-material/Verified';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PieChartIcon from '@mui/icons-material/PieChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import DangerousIcon from '@mui/icons-material/Dangerous';
import { SvgIconComponent } from '@mui/icons-material';
import { ExecutiveMetricTable } from '@/types/dashboard/executive-summary';
import { useExecutiveSummary } from './useExecutiveSummary';
import { useAttendanceSummary } from './useAttendanceSummary';
import { useTrackingSummary } from './useTrackingSummary';
import { useDropoutSummary } from './useDropoutSummary';

export interface PrimaryKpiItem {
  id: ExecutiveMetricTable;
  title: string;
  tooltip: string;
  value: number;
  icon: SvgIconComponent;
  color: string;
}

export interface DerivedKpiItem {
  id: string;
  title: string;
  tooltip: string;
  value: string;
  icon: SvgIconComponent;
  color: string;
}

const PRIMARY_KPI_ORDER: ExecutiveMetricTable[] = [
  'Beneficiaries',
  'Programs',
  'Sub_Programs',
  'Activities',
  'Attendances',
  'Absences',
  'Reports',
  'Users',
];

const PRIMARY_KPI_CONFIG: Record<
  ExecutiveMetricTable,
  { icon: SvgIconComponent; color: string; i18nKey: string }
> = {
  Beneficiaries: { icon: PeopleIcon, color: '#29ABE2', i18nKey: 'beneficiaries' },
  Programs: { icon: SchoolIcon, color: '#7B61FF', i18nKey: 'programs' },
  Sub_Programs: { icon: AccountTreeIcon, color: '#00BFA6', i18nKey: 'subPrograms' },
  Activities: { icon: EventIcon, color: '#FF9800', i18nKey: 'activities' },
  Attendances: { icon: CheckCircleIcon, color: '#4CAF50', i18nKey: 'attendances' },
  Absences: { icon: CancelIcon, color: '#F44336', i18nKey: 'absences' },
  Reports: { icon: ReportProblemIcon, color: '#E91E63', i18nKey: 'reports' },
  Users: { icon: GroupIcon, color: '#607D8B', i18nKey: 'users' },
};

export function useExecutiveSummarySection() {
  const { t } = useTranslation();
  const executiveQuery = useExecutiveSummary();
  const attendanceQuery = useAttendanceSummary();
  const trackingQuery = useTrackingSummary();
  const dropoutQuery = useDropoutSummary();

  const primaryKpis = useMemo<PrimaryKpiItem[]>(() => {
    const metrics = executiveQuery.data?.metrics ?? [];
    const metricsMap = new Map(metrics.map((metric) => [metric.table, metric]));

    return PRIMARY_KPI_ORDER.map((table) => {
      const config = PRIMARY_KPI_CONFIG[table];
      const metric = metricsMap.get(table);

      return {
        id: table,
        title: t(`dashboard.executiveSummary.primaryKpis.${config.i18nKey}.title`),
        tooltip: t(`dashboard.executiveSummary.primaryKpis.${config.i18nKey}.tooltip`),
        value: metric?.value ?? 0,
        icon: config.icon,
        color: config.color,
      };
    });
  }, [executiveQuery.data, t]);

  const derivedKpis = useMemo<DerivedKpiItem[]>(() => {
    const attendance = attendanceQuery.data?.kpis;
    const tracking = trackingQuery.data?.tracking;
    const risk = dropoutQuery.data?.dropout.riskIndicators;

    const items: Array<{
      id: string;
      i18nKey: string;
      value: string;
      icon: SvgIconComponent;
      color: string;
    }> = [
      {
        id: 'effectiveAttendance',
        i18nKey: 'effectiveAttendance',
        value: attendance?.effectiveAttendance.percent ?? '0%',
        icon: TrendingUpIcon,
        color: '#4CAF50',
      },
      {
        id: 'absences',
        i18nKey: 'absences',
        value: attendance?.absences.percent ?? '0%',
        icon: EventBusyIcon,
        color: '#F44336',
      },
      {
        id: 'justifiedAbsences',
        i18nKey: 'justifiedAbsences',
        value: attendance?.justifiedAbsences.percent ?? '0%',
        icon: VerifiedIcon,
        color: '#FF9800',
      },
      {
        id: 'executionVsPlanning',
        i18nKey: 'executionVsPlanning',
        value: tracking?.executionVsPlanning.percent ?? '0%',
        icon: PlayCircleIcon,
        color: '#29ABE2',
      },
      {
        id: 'coverage',
        i18nKey: 'coverage',
        value: tracking?.coverage.percent ?? '0%',
        icon: PieChartIcon,
        color: '#7B61FF',
      },
      {
        id: 'beneficiariesAtRisk',
        i18nKey: 'beneficiariesAtRisk',
        value: String(risk?.totalAtRisk ?? 0),
        icon: WarningAmberIcon,
        color: '#FF5722',
      },
      {
        id: 'neverAttended',
        i18nKey: 'neverAttended',
        value: String(risk?.neverAttended ?? 0),
        icon: PersonOffIcon,
        color: '#9C27B0',
      },
      {
        id: 'criticalRisk',
        i18nKey: 'criticalRisk',
        value: String(risk?.criticalRisk ?? 0),
        icon: DangerousIcon,
        color: '#D32F2F',
      },
    ];

    return items.map((item) => ({
      id: item.id,
      title: t(`dashboard.executiveSummary.derivedKpis.${item.i18nKey}.title`),
      tooltip: t(`dashboard.executiveSummary.derivedKpis.${item.i18nKey}.tooltip`),
      value: item.value,
      icon: item.icon,
      color: item.color,
    }));
  }, [attendanceQuery.data, trackingQuery.data, dropoutQuery.data, t]);

  const isLoading =
    executiveQuery.isLoading ||
    attendanceQuery.isLoading ||
    trackingQuery.isLoading ||
    dropoutQuery.isLoading;

  const isError =
    executiveQuery.isError ||
    attendanceQuery.isError ||
    trackingQuery.isError ||
    dropoutQuery.isError;

  const errorMessage =
    (executiveQuery.error as Error | undefined)?.message ||
    (attendanceQuery.error as Error | undefined)?.message ||
    (trackingQuery.error as Error | undefined)?.message ||
    (dropoutQuery.error as Error | undefined)?.message;

  const refetch = () => {
    void executiveQuery.refetch();
    void attendanceQuery.refetch();
    void trackingQuery.refetch();
    void dropoutQuery.refetch();
  };

  return {
    primaryKpis,
    derivedKpis,
    isLoading,
    isError,
    errorMessage,
    refetch,
  };
}
