'use client';

import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SidebarLayout from '../components/SidebarLayout';
import ExecutiveSummarySection from '../components/executive-summary/ExecutiveSummarySection';

export default function ExecutiveDashboardPage() {
  const { t } = useTranslation();

  return (
    <SidebarLayout>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('dashboard.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('dashboard.subtitle')}
        </Typography>

        <ExecutiveSummarySection />
      </Box>
    </SidebarLayout>
  );
}
