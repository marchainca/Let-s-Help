'use client';

import { Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AttendanceKpiCard from './AttendanceKpiCard';
import KpiCardSkeleton from '../common/KpiCardSkeleton';
import { AttendanceKpiItem } from '@/hooks/dashboard/useAttendanceSummarySection';

interface AttendanceKpiRowProps {
  kpis: AttendanceKpiItem[];
  isLoading: boolean;
}

export default function AttendanceKpiRow({ kpis, isLoading }: AttendanceKpiRowProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {kpis.map((kpi) => (
        <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 3 }}>
          <AttendanceKpiCard
            title={kpi.title}
            tooltip={kpi.tooltip}
            value={kpi.value}
            subtitle={
              kpi.subtitle && kpi.id !== 'beneficiariesPresent'
                ? t('dashboard.attendanceSummary.kpis.countLabel', {
                    count: Number(kpi.subtitle),
                  })
                : undefined
            }
            icon={kpi.icon}
            color={kpi.color}
          />
        </Grid>
      ))}
    </Grid>
  );
}
