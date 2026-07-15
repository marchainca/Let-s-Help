'use client';

import dynamic from 'next/dynamic';
import { Box, Skeleton } from '@mui/material';
import type { EChartsOption } from 'echarts';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={300} />,
});

interface EChartProps {
  option: EChartsOption;
  height?: number | string;
  loading?: boolean;
}

export default function EChart({ option, height = 320, loading = false }: EChartProps) {
  return (
    <Box sx={{ width: '100%', height }}>
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '100%' }}
        showLoading={loading}
        notMerge
        lazyUpdate
      />
    </Box>
  );
}
