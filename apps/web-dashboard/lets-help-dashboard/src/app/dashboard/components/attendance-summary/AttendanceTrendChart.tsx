'use client';

import { Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EChart from '../common/EChart';
import ChartSkeleton from '../common/ChartSkeleton';
import DashboardEmptyState from '../common/DashboardEmptyState';
import type { EChartsOption } from 'echarts';

interface AttendanceTrendChartProps {
  option: EChartsOption;
  isLoading: boolean;
  isEmpty?: boolean;
}

export default function AttendanceTrendChart({
  option,
  isLoading,
  isEmpty = false,
}: AttendanceTrendChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isEmpty) {
    return <DashboardEmptyState message={t('dashboard.common.empty')} />;
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <EChart option={option} height={320} />
      </CardContent>
    </Card>
  );
}
