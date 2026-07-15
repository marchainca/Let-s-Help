'use client';

import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SidebarLayout from '../components/SidebarLayout';
import AttendanceSummarySection from '../components/attendance-summary/AttendanceSummarySection';

export default function AttendanceSummaryDashboardPage() {
  const { t } = useTranslation();

  return (
    <SidebarLayout>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('dashboard.attendanceSummary.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('dashboard.attendanceSummary.subtitle')}
        </Typography>

        <AttendanceSummarySection />
      </Box>
    </SidebarLayout>
  );
}
