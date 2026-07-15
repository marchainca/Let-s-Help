'use client';

import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DashboardSection from '../common/DashboardSection';
import DashboardErrorBoundary from '../common/DashboardErrorBoundary';
import ProgramSummaryCardsGrid from './ProgramSummaryCardsGrid';
import { useProgramSummarySection } from '@/hooks/dashboard/useProgramSummarySection';

export default function ProgramSummarySection() {
  const { t } = useTranslation();
  const { highlights, isEmpty, isLoading, isError, errorMessage, refetch } =
    useProgramSummarySection();

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
        title={t('dashboard.programSummary.section.title')}
        subtitle={t('dashboard.programSummary.section.subtitle')}
      >
        <ProgramSummaryCardsGrid
          highlights={highlights}
          isLoading={isLoading}
          isEmpty={isEmpty}
        />
      </DashboardSection>
    </DashboardErrorBoundary>
  );
}
