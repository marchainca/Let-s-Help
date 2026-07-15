import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import { SvgIconComponent } from '@mui/icons-material';
import { ActivityMetric, ActivitySummaryKey } from '@/types/dashboard/activity-summary';
import { useActivitySummary } from './useActivitySummary';

export interface ActivityHighlightItem {
  id: ActivitySummaryKey;
  title: string;
  tooltip: string;
  activityName: string;
  programName: string;
  subProgramName: string;
  responsibleName: string;
  value: number;
  valueLabel: string;
  icon: SvgIconComponent;
  color: string;
}

const ACTIVITY_CARD_CONFIG: Record<
  ActivitySummaryKey,
  { icon: SvgIconComponent; color: string; i18nKey: string }
> = {
  mostAttendance: { icon: TrendingUpIcon, color: '#4CAF50', i18nKey: 'mostAttendance' },
  leastAttendance: { icon: TrendingDownIcon, color: '#F44336', i18nKey: 'leastAttendance' },
  mostBeneficiaries: { icon: PeopleIcon, color: '#7B61FF', i18nKey: 'mostBeneficiaries' },
};

const ACTIVITY_CARD_ORDER: ActivitySummaryKey[] = [
  'mostAttendance',
  'leastAttendance',
  'mostBeneficiaries',
];

function getMetricValueLabel(
  metric: ActivityMetric,
  value: number,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const metricKey = metric === 'attendance' ? 'attendance' : 'beneficiaries';
  return t(`dashboard.activitySummary.metrics.${metricKey}`, { count: value });
}

export function useActivitySummarySection() {
  const { t } = useTranslation();
  const query = useActivitySummary();

  const highlights = useMemo<ActivityHighlightItem[]>(() => {
    const activities = query.data?.activities;
    if (!activities) return [];

    return ACTIVITY_CARD_ORDER.map((key) => {
      const highlight = activities[key];
      const config = ACTIVITY_CARD_CONFIG[key];

      return {
        id: key,
        title: t(`dashboard.activitySummary.cards.${config.i18nKey}.title`),
        tooltip: t(`dashboard.activitySummary.cards.${config.i18nKey}.tooltip`),
        activityName: highlight?.activity?.name ?? highlight?.name ?? t('dashboard.common.empty'),
        programName: highlight?.program?.name ?? t('dashboard.common.empty'),
        subProgramName: highlight?.subProgram?.name ?? t('dashboard.common.empty'),
        responsibleName: highlight?.responsible?.name ?? t('dashboard.common.empty'),
        value: highlight?.value ?? 0,
        valueLabel: getMetricValueLabel(highlight?.metric ?? 'attendance', highlight?.value ?? 0, t),
        icon: config.icon,
        color: config.color,
      };
    });
  }, [query.data, t]);

  const isEmpty =
    !query.data?.activities ||
    ACTIVITY_CARD_ORDER.every((key) => {
      const highlight = query.data?.activities[key];
      return !highlight?.activity?.name && !highlight?.name;
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
