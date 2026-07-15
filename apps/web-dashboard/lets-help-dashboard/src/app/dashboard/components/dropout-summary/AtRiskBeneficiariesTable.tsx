'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DashboardEmptyState from '../common/DashboardEmptyState';
import RiskLevelChip from './RiskLevelChip';
import { AtRiskBeneficiaryRow } from '@/hooks/dashboard/useDropoutSummarySection';
import { RiskLevel } from '@/types/dashboard/dropout-summary';

interface AtRiskBeneficiariesTableProps {
  rows: AtRiskBeneficiaryRow[];
  filterOptions: {
    riskLevels: RiskLevel[];
    programs: string[];
    subPrograms: string[];
  };
  isLoading: boolean;
}

const ALL_FILTER = 'all';

export default function AtRiskBeneficiariesTable({
  rows,
  filterOptions,
  isLoading,
}: AtRiskBeneficiariesTableProps) {
  const { t } = useTranslation();
  const [riskFilter, setRiskFilter] = useState<string>(ALL_FILTER);
  const [programFilter, setProgramFilter] = useState<string>(ALL_FILTER);
  const [subProgramFilter, setSubProgramFilter] = useState<string>(ALL_FILTER);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (riskFilter !== ALL_FILTER && row.riskLevel !== riskFilter) return false;
      if (programFilter !== ALL_FILTER && row.program !== programFilter) return false;
      if (subProgramFilter !== ALL_FILTER && row.subProgram !== subProgramFilter) return false;
      return true;
    });
  }, [rows, riskFilter, programFilter, subProgramFilter]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleRiskChange = (value: string) => {
    setRiskFilter(value);
    setPage(0);
  };

  const handleProgramChange = (value: string) => {
    setProgramFilter(value);
    setPage(0);
  };

  const handleSubProgramChange = (value: string) => {
    setSubProgramFilter(value);
    setPage(0);
  };

  if (isLoading) {
    return (
      <Card>
        <Box sx={{ p: 2 }}>
          {Array.from({ length: 5 }).map((_, index) => (
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
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t('dashboard.dropoutSummary.filters.riskLevel')}</InputLabel>
          <Select
            label={t('dashboard.dropoutSummary.filters.riskLevel')}
            value={riskFilter}
            onChange={(e) => handleRiskChange(e.target.value)}
          >
            <MenuItem value={ALL_FILTER}>{t('dashboard.dropoutSummary.filters.all')}</MenuItem>
            {filterOptions.riskLevels.map((level) => (
              <MenuItem key={level} value={level}>
                {t(`dashboard.dropoutSummary.riskLevels.${level}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t('dashboard.dropoutSummary.filters.program')}</InputLabel>
          <Select
            label={t('dashboard.dropoutSummary.filters.program')}
            value={programFilter}
            onChange={(e) => handleProgramChange(e.target.value)}
          >
            <MenuItem value={ALL_FILTER}>{t('dashboard.dropoutSummary.filters.all')}</MenuItem>
            {filterOptions.programs.map((program) => (
              <MenuItem key={program} value={program}>
                {program}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t('dashboard.dropoutSummary.filters.subProgram')}</InputLabel>
          <Select
            label={t('dashboard.dropoutSummary.filters.subProgram')}
            value={subProgramFilter}
            onChange={(e) => handleSubProgramChange(e.target.value)}
          >
            <MenuItem value={ALL_FILTER}>{t('dashboard.dropoutSummary.filters.all')}</MenuItem>
            {filterOptions.subPrograms.map((subProgram) => (
              <MenuItem key={subProgram} value={subProgram}>
                {subProgram}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer sx={{ maxHeight: 560 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>
                {t('dashboard.dropoutSummary.table.name')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>
                {t('dashboard.dropoutSummary.table.identification')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>
                {t('dashboard.dropoutSummary.table.program')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>
                {t('dashboard.dropoutSummary.table.subProgram')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>
                {t('dashboard.dropoutSummary.table.lastAttendance')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {t('dashboard.dropoutSummary.table.daysSinceLastAttendance')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {t('dashboard.dropoutSummary.table.totalPresent')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {t('dashboard.dropoutSummary.table.totalAbsent')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {t('dashboard.dropoutSummary.table.totalJustified')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {t('dashboard.dropoutSummary.table.absencePercent')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                {t('dashboard.dropoutSummary.table.riskLevel')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {t('dashboard.dropoutSummary.table.score')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>
                {t('dashboard.dropoutSummary.table.factors')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>
                {t('dashboard.dropoutSummary.table.lastActivity')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {t('dashboard.common.empty')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell>{row.identification}</TableCell>
                  <TableCell>{row.program}</TableCell>
                  <TableCell>{row.subProgram}</TableCell>
                  <TableCell>{row.lastAttendance}</TableCell>
                  <TableCell align="center">{row.daysSinceLastAttendance}</TableCell>
                  <TableCell align="center">{row.totalPresent}</TableCell>
                  <TableCell align="center">{row.totalAbsent}</TableCell>
                  <TableCell align="center">{row.totalJustified}</TableCell>
                  <TableCell align="center">{row.absencePercent}</TableCell>
                  <TableCell>
                    <RiskLevelChip level={row.riskLevel} />
                  </TableCell>
                  <TableCell align="center">{row.score}</TableCell>
                  <TableCell>
                    <Tooltip title={row.factors} arrow>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.factors}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{row.lastActivity}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage={t('dashboard.dropoutSummary.table.rowsPerPage')}
      />
    </Card>
  );
}
