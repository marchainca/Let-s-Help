import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import { SvgIconComponent } from '@mui/icons-material';
import { ProgramMetric, ProgramSummaryKey } from '@/types/dashboard/program-summary';
import { useProgramSummary } from './useProgramSummary';

export interface ProgramHighlightItem {
  id: ProgramSummaryKey;
  title: string;
  tooltip: string;
  programName: string;
  value: number;
  valueLabel: string;
  icon: SvgIconComponent;
  color: string;
}

const PROGRAM_CARD_CONFIG: Record<
  ProgramSummaryKey,
  { icon: SvgIconComponent; color: string; i18nKey: string }
> = {
  mostAttendance: { icon: TrendingUpIcon, color: '#4CAF50', i18nKey: 'mostAttendance' },
  leastAttendance: { icon: TrendingDownIcon, color: '#F44336', i18nKey: 'leastAttendance' },
  mostActivities: { icon: EventIcon, color: '#29ABE2', i18nKey: 'mostActivities' },
  mostBeneficiaries: { icon: PeopleIcon, color: '#7B61FF', i18nKey: 'mostBeneficiaries' },
};

const PROGRAM_CARD_ORDER: ProgramSummaryKey[] = [
  'mostAttendance',
  'leastAttendance',
  'mostActivities',
  'mostBeneficiaries',
];

function getMetricValueLabel(
  metric: ProgramMetric,
  value: number,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const metricKey =
    metric === 'attendance'
      ? 'attendance'
      : metric === 'activities'
        ? 'activities'
        : 'beneficiaries';

  return t(`dashboard.programSummary.metrics.${metricKey}`, { count: value });
}

export function useProgramSummarySection() {
  const { t } = useTranslation();
  const query = useProgramSummary();

  const highlights = useMemo<ProgramHighlightItem[]>(() => {
    const programs = query.data?.programs;
    if (!programs) return [];

    return PROGRAM_CARD_ORDER.map((key) => {
      const highlight = programs[key];
      const config = PROGRAM_CARD_CONFIG[key];

      return {
        id: key,
        title: t(`dashboard.programSummary.cards.${config.i18nKey}.title`),
        tooltip: t(`dashboard.programSummary.cards.${config.i18nKey}.tooltip`),
        programName: highlight?.program?.name ?? highlight?.name ?? t('dashboard.common.empty'),
        value: highlight?.value ?? 0,
        valueLabel: getMetricValueLabel(highlight?.metric ?? 'attendance', highlight?.value ?? 0, t),
        icon: config.icon,
        color: config.color,
      };
    });
  }, [query.data, t]);

  const isEmpty =
    !query.data?.programs ||
    PROGRAM_CARD_ORDER.every((key) => {
      const highlight = query.data?.programs[key];
      return !highlight?.program?.name && !highlight?.name;
    });

  return {
    highlights,
    isEmpty,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: (query.error as Error | undefined)?.message,
    refetch: query.refetch,
  };
}
