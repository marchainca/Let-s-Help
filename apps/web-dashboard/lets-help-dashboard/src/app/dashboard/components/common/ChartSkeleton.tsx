'use client';

import { Card, CardContent, Skeleton } from '@mui/material';

interface ChartSkeletonProps {
  height?: number;
}

export default function ChartSkeleton({ height = 320 }: ChartSkeletonProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Skeleton variant="text" width="50%" height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={height} />
      </CardContent>
    </Card>
  );
}
