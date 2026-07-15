'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useTranslation } from 'react-i18next';
import DashboardEmptyState from '../common/DashboardEmptyState';
import { SmartAlert, SmartAlertSeverity } from '@/types/dashboard/smart-alerts';

const SEVERITY_CONFIG: Record<
  SmartAlertSeverity,
  { icon: typeof ErrorOutlineIcon; color: string; chipColor: 'error' | 'warning' | 'info' }
> = {
  critical: { icon: ErrorOutlineIcon, color: '#F44336', chipColor: 'error' },
  warning: { icon: WarningAmberIcon, color: '#FF9800', chipColor: 'warning' },
  info: { icon: InfoOutlinedIcon, color: '#29ABE2', chipColor: 'info' },
};

interface SmartAlertCardProps {
  alert: SmartAlert;
}

function SmartAlertCard({ alert }: SmartAlertCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  return (
    <Card
      sx={{
        height: '100%',
        border: `1px solid ${alpha(config.color, 0.3)}`,
        borderLeft: `4px solid ${config.color}`,
        boxShadow: theme.palette.mode === 'light' ? 2 : 4,
        transition: 'transform 0.2s ease',
        '&:hover': { transform: 'translateY(-2px)' },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(config.color, 0.12),
              color: config.color,
              flexShrink: 0,
            }}
          >
            <Icon />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Chip
                label={t(`dashboard.smartAlerts.severity.${alert.severity}`)}
                color={config.chipColor}
                size="small"
              />
              <Chip
                label={t(`dashboard.smartAlerts.sources.${alert.source}`)}
                size="small"
                variant="outlined"
              />
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {alert.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {alert.description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

interface SmartAlertsGridProps {
  alerts: SmartAlert[];
  isLoading: boolean;
}

export default function SmartAlertsGrid({ alerts, isLoading }: SmartAlertsGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={120} />
        ))}
      </Box>
    );
  }

  if (alerts.length === 0) {
    return (
      <DashboardEmptyState message={t('dashboard.smartAlerts.empty')} />
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <NotificationsActiveIcon color="warning" />
        <Typography variant="body2" color="text.secondary">
          {t('dashboard.smartAlerts.count', { count: alerts.length })}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {alerts.map((alert) => (
          <SmartAlertCard key={alert.id} alert={alert} />
        ))}
      </Box>
    </Box>
  );
}
