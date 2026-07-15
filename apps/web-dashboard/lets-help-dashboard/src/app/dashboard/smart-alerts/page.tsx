'use client';

import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SidebarLayout from '../components/SidebarLayout';
import SmartAlertsSection from '../components/smart-alerts/SmartAlertsSection';

export default function SmartAlertsDashboardPage() {
  const { t } = useTranslation();

  return (
    <SidebarLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('dashboard.smartAlerts.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('dashboard.smartAlerts.subtitle')}
        </Typography>

        <SmartAlertsSection />
      </Box>
    </SidebarLayout>
  );
}
