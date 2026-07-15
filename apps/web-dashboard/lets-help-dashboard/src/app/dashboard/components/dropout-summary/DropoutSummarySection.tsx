'use client';

import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DashboardSection from '../common/DashboardSection';
import DashboardErrorBoundary from '../common/DashboardErrorBoundary';
import RiskIndicatorsRow from './RiskIndicatorsRow';
import PeriodDistributionRow from './PeriodDistributionRow';
import AtRiskBeneficiariesTable from './AtRiskBeneficiariesTable';
import { useDropoutSummarySection } from '@/hooks/dashboard/useDropoutSummarySection';

export default function DropoutSummarySection() {
  const { t } = useTranslation();
  const {
    riskKpis,
    periodCards,
    beneficiaries,
    filterOptions,
    isLoading,
    isError,
    errorMessage,
    refetch,
  } = useDropoutSummarySection();

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
        title={t('dashboard.dropoutSummary.riskSection.title')}
        subtitle={t('dashboard.dropoutSummary.riskSection.subtitle')}
      >
        <RiskIndicatorsRow kpis={riskKpis} isLoading={isLoading} />
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.dropoutSummary.periodSection.title')}
        subtitle={t('dashboard.dropoutSummary.periodSection.subtitle')}
      >
        <PeriodDistributionRow periods={periodCards} isLoading={isLoading} />
      </DashboardSection>

      <DashboardSection
        title={t('dashboard.dropoutSummary.tableSection.title')}
        subtitle={t('dashboard.dropoutSummary.tableSection.subtitle')}
      >
        <AtRiskBeneficiariesTable
          rows={beneficiaries}
          filterOptions={filterOptions}
          isLoading={isLoading}
        />
      </DashboardSection>
    </DashboardErrorBoundary>
  );
}
