'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  alpha,
  useTheme,
  Grid2 as Grid,
} from '@mui/material';
import KpiCardSkeleton from '../common/KpiCardSkeleton';
import AnimatedCounter from '../common/AnimatedCounter';
import { DropoutPeriodCardItem } from '@/hooks/dashboard/useDropoutSummarySection';

interface PeriodDistributionRowProps {
  periods: DropoutPeriodCardItem[];
  isLoading: boolean;
}

export default function PeriodDistributionRow({ periods, isLoading }: PeriodDistributionRowProps) {
  const theme = useTheme();

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
      {periods.map((period) => {
        const Icon = period.icon;

        return (
          <Grid key={period.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Tooltip title={period.tooltip} arrow placement="top">
              <Card
                sx={{
                  height: '100%',
                  border: `1px solid ${alpha(period.color, 0.25)}`,
                  boxShadow: theme.palette.mode === 'light' ? 2 : 4,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(period.color, 0.12),
                        color: period.color,
                      }}
                    >
                      <Icon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {period.title}
                      </Typography>
                      <AnimatedCounter value={period.count} color={period.color} variant="h5" />
                      <Typography variant="caption" color="text.secondary">
                        {period.tooltip}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        );
      })}
    </Grid>
  );
}
