'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import { useTranslation } from 'react-i18next';

interface DashboardEmptyStateProps {
  message?: string;
}

export default function DashboardEmptyState({ message }: DashboardEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            gap: 1,
            color: 'text.secondary',
          }}
        >
          <InboxIcon sx={{ fontSize: 48, opacity: 0.5 }} />
          <Typography variant="body1">{message ?? t('dashboard.common.empty')}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
