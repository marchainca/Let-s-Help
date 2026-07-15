import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { EChartsOption } from 'echarts';
import { useTrackingSummary } from './useTrackingSummary';
import { useAppTheme } from '@/providers/ThemeProvider';
import {
  buildExecutionBarOption,
  buildGaugeOption,
  getChartThemeColors,
  parsePercent,
} from './trackingChartOptions';

export interface ComplianceTableRow {
  rank: number;
  id: number;
  name: string;
  executed: number;
  planned: number;
  actualAttendees: number;
  projectedAttendees: number;
  executionPercent: string;
  executionRatio: number;
  coveragePercent: string;
  coverageRatio: number;
  compliancePercent: string;
  complianceRatio: number;
}

export function useTrackingSummarySection() {
  const { t } = useTranslation();
  const { mode } = useAppTheme();
  const query = useTrackingSummary();
  const colors = getChartThemeColors(mode);

  const executionBarOption = useMemo<EChartsOption>(() => {
    const execution = query.data?.tracking.executionVsPlanning;

    return buildExecutionBarOption(
      execution?.planned ?? 0,
      execution?.executed ?? 0,
      t('dashboard.trackingSummary.charts.planned'),
      t('dashboard.trackingSummary.charts.executed'),
      t('dashboard.trackingSummary.charts.barTitle'),
      colors
    );
  }, [query.data, t, colors]);

  const executionGaugeOption = useMemo<EChartsOption>(() => {
    const percent = parsePercent(query.data?.tracking.executionVsPlanning.percent ?? '0%');

    return buildGaugeOption(
      percent,
      t('dashboard.trackingSummary.charts.executionGaugeTitle'),
      colors,
      '#29ABE2'
    );
  }, [query.data, t, colors]);

  const coverageGaugeOption = useMemo<EChartsOption>(() => {
    const percent = parsePercent(query.data?.tracking.coverage.percent ?? '0%');

    return buildGaugeOption(
      percent,
      t('dashboard.trackingSummary.charts.coverageGaugeTitle'),
      colors,
      '#7B61FF'
    );
  }, [query.data, t, colors]);

  const complianceRows = useMemo<ComplianceTableRow[]>(() => {
    const rows = query.data?.tracking.responsibleCompliance ?? [];

    return [...rows]
      .sort((a, b) => b.complianceLevel.ratio - a.complianceLevel.ratio)
      .map((row, index) => ({
        rank: index + 1,
        id: row.id,
        name: row.responsible?.name ?? row.name,
        executed: row.executed,
        planned: row.planned,
        actualAttendees: row.actualAttendees,
        projectedAttendees: row.projectedAttendees,
        executionPercent: row.executionCompliance.percent,
        executionRatio: row.executionCompliance.ratio,
        coveragePercent: row.coverageCompliance.percent,
        coverageRatio: row.coverageCompliance.ratio,
        compliancePercent: row.complianceLevel.percent,
        complianceRatio: row.complianceLevel.ratio,
      }));
  }, [query.data]);

  const hasChartData = useMemo(() => {
    const tracking = query.data?.tracking;
    if (!tracking) return false;

    return (
      tracking.executionVsPlanning.planned > 0 ||
      tracking.executionVsPlanning.executed > 0 ||
      tracking.coverage.projectedAttendees > 0
    );
  }, [query.data]);

  return {
    executionBarOption,
    executionGaugeOption,
    coverageGaugeOption,
    complianceRows,
    hasChartData,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: (query.error as Error | undefined)?.message,
    refetch: query.refetch,
  };
}
