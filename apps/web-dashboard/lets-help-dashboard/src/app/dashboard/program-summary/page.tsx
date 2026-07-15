'use client';

import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SidebarLayout from '../components/SidebarLayout';
import ProgramSummarySection from '../components/program-summary/ProgramSummarySection';

export default function ProgramSummaryDashboardPage() {
  const { t } = useTranslation();

  return (
    <SidebarLayout>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('dashboard.programSummary.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('dashboard.programSummary.subtitle')}
        </Typography>

        <ProgramSummarySection />
      </Box>
    </SidebarLayout>
  );
}
