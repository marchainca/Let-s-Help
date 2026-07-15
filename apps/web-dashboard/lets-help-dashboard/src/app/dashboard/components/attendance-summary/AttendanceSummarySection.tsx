'use client';

import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from '@mui/material';
import DashboardSection from '../common/DashboardSection';
import DashboardErrorBoundary from '../common/DashboardErrorBoundary';
import AttendanceKpiRow from './AttendanceKpiRow';
import AttendanceTrendChart from './AttendanceTrendChart';
import AttendanceStatusDonut from './AttendanceStatusDonut';
import AttendanceRankingsGrid from './AttendanceRankingsGrid';
import { useAttendanceSummarySection } from '@/hooks/dashboard/useAttendanceSummarySection';

export default function AttendanceSummarySection() {
  const { t } = useTranslation();
  const {
    kpiCards,
    trendChartOption,
    donutChartOption,
    rankings,
    hasChartData,
    isLoading,
    isError,
    errorMessage,
    refetch,
  } = useAttendanceSummarySection();

  return (
    <DashboardErrorBoundary onRetry={refetch}>
      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('dashboard.common.retry')}
            </Button>
          }
        >
          {errorMessage || t('dashboard.common.error')}
        </Alert>
      )}

      <DashboardSection
        title={t('dashboard.attendanceSummary.kpiSection.title')}
        subtitle={t('dashboard.attendanceSummary.kpiSection.subtitle')}
      >
        <AttendanceKpiRow kpis={kpiCards} isLoading={isLoading} />
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.attendanceSummary.chartsSection.title')}
        subtitle={t('dashboard.attendanceSummary.chartsSection.subtitle')}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <AttendanceTrendChart
              option={trendChartOption}
              isLoading={isLoading}
              isEmpty={!hasChartData}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <AttendanceStatusDonut
              option={donutChartOption}
              isLoading={isLoading}
              isEmpty={!hasChartData}
            />
          </Grid>
        </Grid>
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.attendanceSummary.rankingsSection.title')}
        subtitle={t('dashboard.attendanceSummary.rankingsSection.subtitle')}
      >
        <AttendanceRankingsGrid rankings={rankings} isLoading={isLoading} />
      </DashboardSection>
    </DashboardErrorBoundary>
  );
}
