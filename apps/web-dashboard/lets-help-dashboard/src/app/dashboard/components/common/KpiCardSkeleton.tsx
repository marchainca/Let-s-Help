'use client';

import { Card, CardContent, Skeleton, Box } from '@mui/material';

export default function KpiCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
