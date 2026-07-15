'use client';

import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DashboardSection from '../common/DashboardSection';
import DashboardErrorBoundary from '../common/DashboardErrorBoundary';
import ActivitySummaryCardsGrid from './ActivitySummaryCardsGrid';
import { useActivitySummarySection } from '@/hooks/dashboard/useActivitySummarySection';

export default function ActivitySummarySection() {
  const { t } = useTranslation();
  const { highlights, isEmpty, isLoading, isError, errorMessage, refetch } =
    useActivitySummarySection();

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
        title={t('dashboard.activitySummary.section.title')}
        subtitle={t('dashboard.activitySummary.section.subtitle')}
      >
        <ActivitySummaryCardsGrid
          highlights={highlights}
          isLoading={isLoading}
          isEmpty={isEmpty}
        />
      </DashboardSection>
    </DashboardErrorBoundary>
  );
}
