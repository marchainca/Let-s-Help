'use client';

import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SidebarLayout from '../components/SidebarLayout';
import TrackingSummarySection from '../components/tracking-summary/TrackingSummarySection';

export default function TrackingSummaryDashboardPage() {
  const { t } = useTranslation();

  return (
    <SidebarLayout>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('dashboard.trackingSummary.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('dashboard.trackingSummary.subtitle')}
        </Typography>

        <TrackingSummarySection />
      </Box>
    </SidebarLayout>
  );
}
