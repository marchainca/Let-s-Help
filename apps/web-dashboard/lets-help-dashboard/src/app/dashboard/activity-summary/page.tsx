'use client';

import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SidebarLayout from '../components/SidebarLayout';
import ActivitySummarySection from '../components/activity-summary/ActivitySummarySection';

export default function ActivitySummaryDashboardPage() {
  const { t } = useTranslation();

  return (
    <SidebarLayout>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('dashboard.activitySummary.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('dashboard.activitySummary.subtitle')}
        </Typography>

        <ActivitySummarySection />
      </Box>
    </SidebarLayout>
  );
}
