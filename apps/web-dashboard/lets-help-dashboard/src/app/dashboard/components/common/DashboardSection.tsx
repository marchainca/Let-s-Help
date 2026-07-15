'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function DashboardSection({ title, subtitle, children }: DashboardSectionProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}
