'use client';

import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DashboardSection from '../common/DashboardSection';
import DashboardErrorBoundary from '../common/DashboardErrorBoundary';
import SmartAlertsGrid from './SmartAlertsGrid';
import { useSmartAlertsSection } from '@/hooks/dashboard/useSmartAlertsSection';

export default function SmartAlertsSection() {
  const { t } = useTranslation();
  const { alerts, isLoading, isError, errorMessage, refetch } = useSmartAlertsSection();

  return (
    <DashboardErrorBoundary onRetry={refetch}>
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

      <DashboardSection
        title={t('dashboard.smartAlerts.section.title')}
        subtitle={t('dashboard.smartAlerts.section.subtitle')}
      >
        <SmartAlertsGrid alerts={alerts} isLoading={isLoading} />
      </DashboardSection>
    </DashboardErrorBoundary>
  );
}
