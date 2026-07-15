'use client';

import { Alert, Button, Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DashboardSection from '../common/DashboardSection';
import DashboardErrorBoundary from '../common/DashboardErrorBoundary';
import TrackingChartCard from './TrackingChartCard';
import ResponsibleComplianceTable from './ResponsibleComplianceTable';
import { useTrackingSummarySection } from '@/hooks/dashboard/useTrackingSummarySection';

export default function TrackingSummarySection() {
  const { t } = useTranslation();
  const {
    executionBarOption,
    executionGaugeOption,
    coverageGaugeOption,
    complianceRows,
    hasChartData,
    isLoading,
    isError,
    errorMessage,
    refetch,
  } = useTrackingSummarySection();

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
        title={t('dashboard.trackingSummary.chartsSection.title')}
        subtitle={t('dashboard.trackingSummary.chartsSection.subtitle')}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <TrackingChartCard
              option={executionBarOption}
              isLoading={isLoading}
              isEmpty={!hasChartData}
              height={300}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <TrackingChartCard
              option={executionGaugeOption}
              isLoading={isLoading}
              isEmpty={!hasChartData}
              height={300}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <TrackingChartCard
              option={coverageGaugeOption}
              isLoading={isLoading}
              isEmpty={!hasChartData}
              height={300}
            />
          </Grid>
        </Grid>
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.trackingSummary.tableSection.title')}
        subtitle={t('dashboard.trackingSummary.tableSection.subtitle')}
      >
        <ResponsibleComplianceTable rows={complianceRows} isLoading={isLoading} />
      </DashboardSection>
    </DashboardErrorBoundary>
  );
}
