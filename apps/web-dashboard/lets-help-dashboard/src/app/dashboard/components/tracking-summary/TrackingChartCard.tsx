'use client';

import { Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EChart from '../common/EChart';
import ChartSkeleton from '../common/ChartSkeleton';
import DashboardEmptyState from '../common/DashboardEmptyState';
import type { EChartsOption } from 'echarts';

interface TrackingChartCardProps {
  option: EChartsOption;
  isLoading: boolean;
  isEmpty?: boolean;
  height?: number;
}

export default function TrackingChartCard({
  option,
  isLoading,
  isEmpty = false,
  height = 280,
}: TrackingChartCardProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <ChartSkeleton height={height} />;
  }

  if (isEmpty) {
    return <DashboardEmptyState message={t('dashboard.common.empty')} />;
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <EChart option={option} height={height} />
      </CardContent>
    </Card>
  );
}
