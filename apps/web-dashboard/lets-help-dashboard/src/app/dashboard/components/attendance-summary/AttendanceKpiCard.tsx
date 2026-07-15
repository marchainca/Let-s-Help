'use client';

import { Card, CardContent, Typography, Box, Tooltip, alpha, useTheme } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface AttendanceKpiCardProps {
  title: string;
  tooltip: string;
  value: string;
  subtitle?: string;
  icon: SvgIconComponent;
  color: string;
}

export default function AttendanceKpiCard({
  title,
  tooltip,
  value,
  subtitle,
  icon: Icon,
  color,
}: AttendanceKpiCardProps) {
  const theme = useTheme();

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
              <Typography variant="h4" fontWeight="bold" sx={{ color }}>
                {value}
              </Typography>
              {subtitle !== undefined && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}
