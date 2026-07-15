'use client';

import { Grid2 as Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import KpiCard from '../common/KpiCard';
import KpiCardSkeleton from '../common/KpiCardSkeleton';
import { DerivedKpiItem } from '@/hooks/dashboard/useExecutiveSummarySection';

interface DerivedKpiRowProps {
  kpis: DerivedKpiItem[];
  isLoading: boolean;
}

export default function DerivedKpiRow({ kpis, isLoading }: DerivedKpiRowProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <KpiCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {kpis.map((kpi) => (
        <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <KpiCard
            title={kpi.title}
            tooltip={kpi.tooltip}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
          />
        </Grid>
      ))}
      {kpis.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Typography color="text.secondary">{t('dashboard.common.empty')}</Typography>
        </Grid>
      )}
    </Grid>
  );
}
