'use client';

import { Grid2 as Grid } from '@mui/material';
import ProgramHighlightCard from '../program-summary/ProgramHighlightCard';
import KpiCardSkeleton from '../common/KpiCardSkeleton';
import DashboardEmptyState from '../common/DashboardEmptyState';
import { SubProgramHighlightItem } from '@/hooks/dashboard/useSubProgramSummarySection';

interface SubProgramSummaryCardsGridProps {
  highlights: SubProgramHighlightItem[];
  isLoading: boolean;
  isEmpty: boolean;
}

export default function SubProgramSummaryCardsGrid({
  highlights,
  isLoading,
  isEmpty,
}: SubProgramSummaryCardsGridProps) {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
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
        <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 3 }}>
          <ProgramHighlightCard
            title={item.title}
            tooltip={item.tooltip}
            programName={item.subProgramName}
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
