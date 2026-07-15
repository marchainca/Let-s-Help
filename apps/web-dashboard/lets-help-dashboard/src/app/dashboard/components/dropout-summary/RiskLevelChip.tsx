'use client';

import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RiskLevel } from '@/types/dashboard/dropout-summary';
import { RISK_LEVEL_COLORS } from '@/hooks/dashboard/dropoutUtils';

interface RiskLevelChipProps {
  level: RiskLevel;
}

export default function RiskLevelChip({ level }: RiskLevelChipProps) {
  const { t } = useTranslation();
  const colors = RISK_LEVEL_COLORS[level];

  return (
    <Chip
      label={t(`dashboard.dropoutSummary.riskLevels.${level}`)}
      size="small"
      sx={{
        backgroundColor: colors.backgroundColor,
        color: colors.color,
        fontWeight: 600,
      }}
    />
  );
}
