'use client';

import { Box, Typography, Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DashboardSection from '../common/DashboardSection';
import DashboardErrorBoundary from '../common/DashboardErrorBoundary';
import PrimaryKpiRow from './PrimaryKpiRow';
import DerivedKpiRow from './DerivedKpiRow';
import { useExecutiveSummarySection } from '@/hooks/dashboard/useExecutiveSummarySection';

export default function ExecutiveSummarySection() {
  const { t } = useTranslation();
  const { primaryKpis, derivedKpis, isLoading, isError, errorMessage, refetch } =
    useExecutiveSummarySection();

  return (
    <DashboardErrorBoundary onRetry={refetch}>
      <DashboardSection
        title={t('dashboard.executiveSummary.title')}
        subtitle={t('dashboard.executiveSummary.subtitle')}
      >
        {isError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={refetch}>
                {t('dashboard.common.retry')}
              </Button>
            }
          >
            {errorMessage || t('dashboard.common.error')}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            {t('dashboard.executiveSummary.primaryRowTitle')}
          </Typography>
          <PrimaryKpiRow kpis={primaryKpis} isLoading={isLoading} />
        </Box>

        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            {t('dashboard.executiveSummary.derivedRowTitle')}
          </Typography>
          <DerivedKpiRow kpis={derivedKpis} isLoading={isLoading} />
        </Box>
      </DashboardSection>
    </DashboardErrorBoundary>
  );
}
