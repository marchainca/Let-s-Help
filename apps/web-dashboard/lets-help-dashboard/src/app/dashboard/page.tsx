'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';

import SidebarLayout from './components/SidebarLayout';
import DashboardSection from './components/common/DashboardSection';
import DashboardEmptyState from './components/common/DashboardEmptyState';
import EditActivityModal from './components/EditActivityModal';
import params from '@/params';
import { withAcceptLanguage } from '@/lib/apiHeaders';
import {
  ActivityFilters,
  ActivityTableRow,
  IActivityContent,
  IProgram,
  buildActivityTableRows,
  collectAvailableYears,
  formatExecutionDate,
} from '@/lib/activitiesUtils';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || '';
}

function getUserId() {
  if (typeof window === 'undefined') return '';

  const userData = localStorage.getItem('userData');
  if (!userData) return '';

  try {
    return JSON.parse(userData).idNumber ?? '';
  } catch {
    return '';
  }
}

interface GetProgramsResponseProgram {
  id: string;
  name: string;
  subprograms?: IProgram['subprograms'];
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();

  const [programList, setProgramList] = useState<IProgram[]>([]);
  const [programId, setProgramId] = useState('');
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState(false);

  const [subprogramList, setSubprogramList] = useState<IProgram['subprograms']>([]);
  const [selectedSubprogram, setSelectedSubprogram] = useState('');

  const [activitiesContent, setActivitiesContent] = useState<IActivityContent[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(false);

  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [editRowData, setEditRowData] = useState<ActivityTableRow | null>(null);

  const filters: ActivityFilters = useMemo(
    () => ({
      date: filterDate,
      month: filterMonth,
      year: filterYear,
    }),
    [filterDate, filterMonth, filterYear]
  );

  const availableYears = useMemo(
    () => collectAvailableYears(activitiesContent),
    [activitiesContent]
  );

  const activityRows = useMemo(
    () => buildActivityTableRows(activitiesContent, filters),
    [activitiesContent, filters]
  );

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: String(index + 1),
        label: new Date(2000, index, 1).toLocaleString(i18n.language, { month: 'long' }),
      })),
    [i18n.language]
  );

  const applyProgramSubprograms = (program: IProgram | undefined) => {
    const subprograms = program?.subprograms ?? [];
    setSubprogramList(subprograms);
    setSelectedSubprogram(subprograms[0]?.id ?? '');
  };

  const handleProgramChange = (nextProgramId: string) => {
    setProgramId(nextProgramId);
    const program = programList.find((item) => item.id === nextProgramId);
    applyProgramSubprograms(program);
  };

  const loadPrograms = async () => {
    setProgramsLoading(true);
    setProgramsError(false);

    try {
      const response = await fetch(`${BASE_URL}${params.paths.getPrograms}/${getUserId()}`, {
        method: 'POST',
        headers: withAcceptLanguage({
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 1 && Array.isArray(data.content) && data.content.length > 0) {
        const programs: IProgram[] = data.content.map((program: GetProgramsResponseProgram) => ({
          id: String(program.id),
          name: program.name || t('dashboard.activitiesPage.programUnnamed'),
          subprograms: (program.subprograms ?? []).map((subprogram) => ({
            id: String(subprogram.id),
            name: subprogram.name,
          })),
        }));

        setProgramList(programs);

        if (programId && programs.some((item) => item.id === programId)) {
          const program = programs.find((item) => item.id === programId)!;
          const subprograms = program.subprograms ?? [];
          setSubprogramList(subprograms);

          if (selectedSubprogram && subprograms.some((item) => item.id === selectedSubprogram)) {
            return;
          }

          setSelectedSubprogram(subprograms[0]?.id ?? '');
          return;
        }

        setProgramId(programs[0].id);
        applyProgramSubprograms(programs[0]);
        return;
      }

      setProgramList([]);
      setProgramId('');
      applyProgramSubprograms(undefined);
    } catch (error) {
      console.error('Error al obtener programas:', error);
      setProgramsError(true);
      setProgramList([]);
      setProgramId('');
      applyProgramSubprograms(undefined);
    } finally {
      setProgramsLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!programId || !selectedSubprogram) {
      setActivitiesContent([]);
      return;
    }

    setActivitiesLoading(true);
    setActivitiesError(false);

    const url = `${BASE_URL}${params.paths.activitiesBySubprogram}?programId=${programId}&subprogramId=${selectedSubprogram}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: withAcceptLanguage({
          Authorization: `Bearer ${getAuthToken()}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 1 && Array.isArray(data.content)) {
        setActivitiesContent(data.content);
      } else {
        setActivitiesContent([]);
      }
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      setActivitiesError(true);
      setActivitiesContent([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    void loadPrograms();
  }, [i18n.language]);

  useEffect(() => {
    void fetchActivities();
  }, [programId, selectedSubprogram, i18n.language]);

  const handleClearFilters = () => {
    setFilterDate('');
    setFilterMonth('');
    setFilterYear('');
  };

  const handleOpenModal = (row: ActivityTableRow) => {
    setEditRowData(row);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditRowData(null);
  };

  const handleSaved = () => {
    void fetchActivities();
    handleCloseModal();
  };

  const emptyMessage =
    filterDate || filterMonth || filterYear
      ? t('dashboard.activitiesPage.noMatchingActivities')
      : t('dashboard.activitiesPage.noActivities');

  return (
    <SidebarLayout>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('dashboard.activitiesPage.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('dashboard.activitiesPage.subtitle')}
        </Typography>

        {programsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('dashboard.activitiesPage.programLoadError')}
          </Alert>
        )}

        {activitiesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('dashboard.common.error')}
          </Alert>
        )}

        <DashboardSection
          title={t('dashboard.activitiesPage.filtersSection.title')}
          subtitle={t('dashboard.activitiesPage.filtersSection.subtitle')}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
              mb: 2,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>{t('dashboard.activitiesPage.programLabel')}</InputLabel>
              <Select
                label={t('dashboard.activitiesPage.programLabel')}
                value={programId}
                onChange={(event) => handleProgramChange(event.target.value)}
                disabled={programsLoading || programList.length === 0}
              >
                {programList.map((program) => (
                  <MenuItem key={program.id} value={program.id}>
                    {program.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>{t('dashboard.activitiesPage.subprogramLabel')}</InputLabel>
              <Select
                label={t('dashboard.activitiesPage.subprogramLabel')}
                value={selectedSubprogram}
                onChange={(event) => setSelectedSubprogram(event.target.value)}
                disabled={!programId || subprogramList.length === 0}
              >
                {subprogramList.map((subprogram) => (
                  <MenuItem key={subprogram.id} value={subprogram.id}>
                    {subprogram.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t('dashboard.activitiesPage.filterDate')}
              type="date"
              size="small"
              fullWidth
              value={filterDate}
              onChange={(event) => setFilterDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>{t('dashboard.activitiesPage.filterMonth')}</InputLabel>
              <Select
                label={t('dashboard.activitiesPage.filterMonth')}
                value={filterMonth}
                onChange={(event) => setFilterMonth(event.target.value)}
              >
                <MenuItem value="">{t('dashboard.activitiesPage.all')}</MenuItem>
                {monthOptions.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>{t('dashboard.activitiesPage.filterYear')}</InputLabel>
              <Select
                label={t('dashboard.activitiesPage.filterYear')}
                value={filterYear}
                onChange={(event) => setFilterYear(event.target.value)}
              >
                <MenuItem value="">{t('dashboard.activitiesPage.all')}</MenuItem>
                {availableYears.map((year) => (
                  <MenuItem key={year} value={String(year)}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="outlined" onClick={handleClearFilters}>
                {t('dashboard.activitiesPage.clearFilters')}
              </Button>
            </Box>
          </Box>
        </DashboardSection>

        <DashboardSection
          title={t('dashboard.activitiesPage.tableSection.title')}
          subtitle={t('dashboard.activitiesPage.tableSection.subtitle')}
        >
          <Card variant="outlined" sx={{ overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.activitiesPage.activityDescription')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.activitiesPage.executionDate')}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.activitiesPage.activitiesShort')}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.activitiesPage.attendanceShort')}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {t('dashboard.activitiesPage.edit')}
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {activitiesLoading &&
                    Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 5 }).map((__, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}

                  {!activitiesLoading &&
                    activityRows.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>
                          {formatExecutionDate(
                            row.executionDate,
                            i18n.language,
                            t('dashboard.activitiesPage.noExecutionDate')
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {row.projectedActivities}/{row.executedActivities}
                        </TableCell>
                        <TableCell align="center">
                          {row.projectedAttendees}/{row.actualAttendees}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleOpenModal(row)} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                  {!activitiesLoading && activityRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <DashboardEmptyState message={emptyMessage} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </DashboardSection>
      </Box>

      {editRowData && (
        <EditActivityModal
          open={openModal}
          onClose={handleCloseModal}
          onSaved={handleSaved}
          rowData={editRowData}
          programId={programId}
          subprogramId={selectedSubprogram}
        />
      )}
    </SidebarLayout>
  );
}
