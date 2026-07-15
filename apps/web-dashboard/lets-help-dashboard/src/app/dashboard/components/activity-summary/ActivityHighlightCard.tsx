'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import AnimatedCounter from '../common/AnimatedCounter';

interface ActivityHighlightCardProps {
  title: string;
  tooltip: string;
  activityName: string;
  programName: string;
  subProgramName: string;
  responsibleName: string;
  programLabel: string;
  subProgramLabel: string;
  responsibleLabel: string;
  value: number;
  valueLabel: string;
  icon: SvgIconComponent;
  color: string;
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontWeight: 600 }}>
        {label}:
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.35,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function ActivityHighlightCard({
  title,
  tooltip,
  activityName,
  programName,
  subProgramName,
  responsibleName,
  programLabel,
  subProgramLabel,
  responsibleLabel,
  value,
  valueLabel,
  icon: Icon,
  color,
}: ActivityHighlightCardProps) {
  const theme = useTheme();

  return (
    <Tooltip title={`${tooltip} — ${activityName}`} arrow placement="top">
      <Card
        sx={{
          height: '100%',
          border: `1px solid ${alpha(color, 0.2)}`,
          boxShadow: theme.palette.mode === 'light' ? 2 : 4,
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
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
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600, lineHeight: 1.3, pt: 0.5 }}
            >
              {title}
            </Typography>
          </Box>

          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.35,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              minHeight: '3.9em',
            }}
          >
            {activityName}
          </Typography>

          <Divider sx={{ opacity: 0.6 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <MetadataRow label={programLabel} value={programName} />
            <MetadataRow label={subProgramLabel} value={subProgramName} />
            <MetadataRow label={responsibleLabel} value={responsibleName} />
          </Box>

          <Box sx={{ mt: 'auto' }}>
            <AnimatedCounter value={value} color={color} variant="h4" />
            <Typography variant="caption" color="text.secondary">
              {valueLabel}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}
