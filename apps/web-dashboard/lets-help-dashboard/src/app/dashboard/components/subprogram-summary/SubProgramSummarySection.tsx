'use client';

import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DashboardSection from '../common/DashboardSection';
import DashboardErrorBoundary from '../common/DashboardErrorBoundary';
import SubProgramSummaryCardsGrid from './SubProgramSummaryCardsGrid';
import { useSubProgramSummarySection } from '@/hooks/dashboard/useSubProgramSummarySection';

export default function SubProgramSummarySection() {
  const { t } = useTranslation();
  const { highlights, isEmpty, isLoading, isError, errorMessage, refetch } =
    useSubProgramSummarySection();

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
        title={t('dashboard.subProgramSummary.section.title')}
        subtitle={t('dashboard.subProgramSummary.section.subtitle')}
      >
        <SubProgramSummaryCardsGrid
          highlights={highlights}
          isLoading={isLoading}
          isEmpty={isEmpty}
        />
      </DashboardSection>
    </DashboardErrorBoundary>
  );
}
