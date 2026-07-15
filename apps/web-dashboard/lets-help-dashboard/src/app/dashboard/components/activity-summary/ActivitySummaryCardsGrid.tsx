'use client';

import { Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ActivityHighlightCard from './ActivityHighlightCard';
import KpiCardSkeleton from '../common/KpiCardSkeleton';
import DashboardEmptyState from '../common/DashboardEmptyState';
import { ActivityHighlightItem } from '@/hooks/dashboard/useActivitySummarySection';

interface ActivitySummaryCardsGridProps {
  highlights: ActivityHighlightItem[];
  isLoading: boolean;
  isEmpty: boolean;
}

export default function ActivitySummaryCardsGrid({
  highlights,
  isLoading,
  isEmpty,
}: ActivitySummaryCardsGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <KpiCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (isEmpty) {
    return <DashboardEmptyState />;
  }

  return (
    <Grid container spacing={2}>
      {highlights.map((item) => (
        <Grid key={item.id} size={{ xs: 12, md: 4 }}>
          <ActivityHighlightCard
            title={item.title}
            tooltip={item.tooltip}
            activityName={item.activityName}
            programName={item.programName}
            subProgramName={item.subProgramName}
            responsibleName={item.responsibleName}
            programLabel={t('dashboard.activitySummary.metadata.program')}
            subProgramLabel={t('dashboard.activitySummary.metadata.subProgram')}
            responsibleLabel={t('dashboard.activitySummary.metadata.responsible')}
            value={item.value}
            valueLabel={item.valueLabel}
            icon={item.icon}
            color={item.color}
          />
        </Grid>
      ))}
    </Grid>
  );
}
