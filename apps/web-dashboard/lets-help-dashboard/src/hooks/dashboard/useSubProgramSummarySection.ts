import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import { SvgIconComponent } from '@mui/icons-material';
import {
  SubProgramMetric,
  SubProgramSummaryKey,
} from '@/types/dashboard/subprogram-summary';
import { useSubProgramSummary } from './useSubProgramSummary';

export interface SubProgramHighlightItem {
  id: SubProgramSummaryKey;
  title: string;
  tooltip: string;
  subProgramName: string;
  value: number;
  valueLabel: string;
  icon: SvgIconComponent;
  color: string;
}

const SUB_PROGRAM_CARD_CONFIG: Record<
  SubProgramSummaryKey,
  { icon: SvgIconComponent; color: string; i18nKey: string }
> = {
  mostAttendance: { icon: TrendingUpIcon, color: '#4CAF50', i18nKey: 'mostAttendance' },
  leastAttendance: { icon: TrendingDownIcon, color: '#F44336', i18nKey: 'leastAttendance' },
  mostActivities: { icon: EventIcon, color: '#29ABE2', i18nKey: 'mostActivities' },
  mostBeneficiaries: { icon: PeopleIcon, color: '#7B61FF', i18nKey: 'mostBeneficiaries' },
};

const SUB_PROGRAM_CARD_ORDER: SubProgramSummaryKey[] = [
  'mostAttendance',
  'leastAttendance',
  'mostActivities',
  'mostBeneficiaries',
];

function getMetricValueLabel(
  metric: SubProgramMetric,
  value: number,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const metricKey =
    metric === 'attendance'
      ? 'attendance'
      : metric === 'activities'
        ? 'activities'
        : 'beneficiaries';

  return t(`dashboard.subProgramSummary.metrics.${metricKey}`, { count: value });
}

export function useSubProgramSummarySection() {
  const { t } = useTranslation();
  const query = useSubProgramSummary();

  const highlights = useMemo<SubProgramHighlightItem[]>(() => {
    const subPrograms = query.data?.subPrograms;
    if (!subPrograms) return [];

    return SUB_PROGRAM_CARD_ORDER.map((key) => {
      const highlight = subPrograms[key];
      const config = SUB_PROGRAM_CARD_CONFIG[key];

      return {
        id: key,
        title: t(`dashboard.subProgramSummary.cards.${config.i18nKey}.title`),
        tooltip: t(`dashboard.subProgramSummary.cards.${config.i18nKey}.tooltip`),
        subProgramName:
          highlight?.subProgram?.name ?? highlight?.name ?? t('dashboard.common.empty'),
        value: highlight?.value ?? 0,
        valueLabel: getMetricValueLabel(highlight?.metric ?? 'attendance', highlight?.value ?? 0, t),
        icon: config.icon,
        color: config.color,
      };
    });
  }, [query.data, t]);

  const isEmpty =
    !query.data?.subPrograms ||
    SUB_PROGRAM_CARD_ORDER.every((key) => {
      const highlight = query.data?.subPrograms[key];
      return !highlight?.subProgram?.name && !highlight?.name;
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
