'use client';

import { Card, CardContent, Typography, Box, Tooltip, alpha, useTheme } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import AnimatedCounter from './AnimatedCounter';

interface KpiCardProps {
  title: string;
  tooltip: string;
  value: number | string;
  icon: SvgIconComponent;
  color: string;
  isPercentage?: boolean;
}

export default function KpiCard({
  title,
  tooltip,
  value,
  icon: Icon,
  color,
  isPercentage = false,
}: KpiCardProps) {
  const theme = useTheme();
  const isNumeric = typeof value === 'number';

  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Card
        sx={{
          height: '100%',
          border: `1px solid ${alpha(color, 0.2)}`,
          boxShadow: theme.palette.mode === 'light' ? 2 : 4,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(color, 0.12),
                color,
                flexShrink: 0,
              }}
            >
              <Icon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500, lineHeight: 1.3 }}
              >
                {title}
              </Typography>
              {isNumeric ? (
                <AnimatedCounter value={value} suffix={isPercentage ? '%' : ''} color={color} />
              ) : (
                <Typography variant="h4" fontWeight="bold" sx={{ color }}>
                  {value}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}
