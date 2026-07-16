'use client';

import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SidebarLayout from '../components/SidebarLayout';
import ProgramSummarySection from '../components/program-summary/ProgramSummarySection';
import SubProgramSummarySection from '../components/subprogram-summary/SubProgramSummarySection';
import ActivitySummarySection from '../components/activity-summary/ActivitySummarySection';

export default function ConsolidatedSummaryDashboardPage() {
  const { t } = useTranslation();

  return (
    <SidebarLayout>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('dashboard.consolidatedSummary.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('dashboard.consolidatedSummary.subtitle')}
        </Typography>

        <ProgramSummarySection />
        <SubProgramSummarySection />
        <ActivitySummarySection />
      </Box>
    </SidebarLayout>
  );
}
