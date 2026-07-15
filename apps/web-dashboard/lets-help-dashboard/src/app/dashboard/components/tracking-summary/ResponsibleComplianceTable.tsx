'use client';

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Box,
  Typography,
  Skeleton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DashboardEmptyState from '../common/DashboardEmptyState';
import { ComplianceTableRow } from '@/hooks/dashboard/useTrackingSummarySection';

interface ComplianceProgressCellProps {
  percent: string;
  ratio: number;
}

function getProgressColor(ratio: number): 'success' | 'warning' | 'error' {
  if (ratio >= 0.8) return 'success';
  if (ratio >= 0.6) return 'warning';
  return 'error';
}

function ComplianceProgressCell({ percent, ratio }: ComplianceProgressCellProps) {
  const value = Math.min(Math.max(ratio * 100, 0), 100);

  return (
    <Box sx={{ minWidth: 120 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {percent}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        color={getProgressColor(ratio)}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
}

interface ResponsibleComplianceTableProps {
  rows: ComplianceTableRow[];
  isLoading: boolean;
}

export default function ResponsibleComplianceTable({
  rows,
  isLoading,
}: ResponsibleComplianceTableProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <Box sx={{ p: 2 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={40} sx={{ mb: 1 }} />
          ))}
        </Box>
      </Card>
    );
  }

  if (rows.length === 0) {
    return <DashboardEmptyState />;
  }

  return (
    <Card>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                {t('dashboard.trackingSummary.table.responsible')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {t('dashboard.trackingSummary.table.executed')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {t('dashboard.trackingSummary.table.planned')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {t('dashboard.trackingSummary.table.actualAttendees')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {t('dashboard.trackingSummary.table.projectedAttendees')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>
                {t('dashboard.trackingSummary.table.executionCompliance')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>
                {t('dashboard.trackingSummary.table.coverageCompliance')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>
                {t('dashboard.trackingSummary.table.totalCompliance')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.rank}</TableCell>
                <TableCell sx={{ fontWeight: 500, minWidth: 140 }}>{row.name}</TableCell>
                <TableCell align="center">{row.executed}</TableCell>
                <TableCell align="center">{row.planned}</TableCell>
                <TableCell align="center">{row.actualAttendees}</TableCell>
                <TableCell align="center">{row.projectedAttendees}</TableCell>
                <TableCell>
                  <ComplianceProgressCell
                    percent={row.executionPercent}
                    ratio={row.executionRatio}
                  />
                </TableCell>
                <TableCell>
                  <ComplianceProgressCell
                    percent={row.coveragePercent}
                    ratio={row.coverageRatio}
                  />
                </TableCell>
                <TableCell>
                  <ComplianceProgressCell
                    percent={row.compliancePercent}
                    ratio={row.complianceRatio}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
