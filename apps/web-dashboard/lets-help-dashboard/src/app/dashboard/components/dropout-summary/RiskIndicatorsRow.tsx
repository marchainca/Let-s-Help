'use client';

import { Grid2 as Grid } from '@mui/material';
import KpiCard from '../common/KpiCard';
import KpiCardSkeleton from '../common/KpiCardSkeleton';
import { DropoutKpiItem } from '@/hooks/dashboard/useDropoutSummarySection';

interface RiskIndicatorsRowProps {
  kpis: DropoutKpiItem[];
  isLoading: boolean;
}

export default function RiskIndicatorsRow({ kpis, isLoading }: RiskIndicatorsRowProps) {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <KpiCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {kpis.map((kpi) => (
        <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard
            title={kpi.title}
            tooltip={kpi.tooltip}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
          />
        </Grid>
      ))}
    </Grid>
  );
}
