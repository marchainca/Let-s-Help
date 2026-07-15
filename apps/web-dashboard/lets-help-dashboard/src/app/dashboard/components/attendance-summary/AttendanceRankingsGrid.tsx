'use client';

import { Grid2 as Grid, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EChart from '../common/EChart';
import ChartSkeleton from '../common/ChartSkeleton';
import DashboardEmptyState from '../common/DashboardEmptyState';
import { AttendanceRankingItem } from '@/hooks/dashboard/useAttendanceSummarySection';

interface AttendanceRankingsGridProps {
  rankings: AttendanceRankingItem[];
  isLoading: boolean;
}

export default function AttendanceRankingsGrid({ rankings, isLoading }: AttendanceRankingsGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, md: 6 }}>
            <ChartSkeleton height={280} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (rankings.every((ranking) => ranking.items.length === 0)) {
    return <DashboardEmptyState message={t('dashboard.common.empty')} />;
  }

  return (
    <Grid container spacing={2}>
      {rankings.map((ranking) => (
        <Grid key={ranking.id} size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              {ranking.items.length > 0 ? (
                <EChart option={ranking.chartOption} height={ranking.chartHeight} />
              ) : (
                <DashboardEmptyState message={t('dashboard.common.empty')} />
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
