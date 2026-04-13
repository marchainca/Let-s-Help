'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import SidebarLayout from './components/SidebarLayout';
import EditActivityModal from './components/EditActivityModal'; // SE AGREGÓ

interface ISubprogram {
  id: string;
  name: string;
}

interface IActivity {
  weekNumber: number;
  projectedActivities: number;
  executedActivities: number;
  projectedAttendees: number;
  actualAttendees: number;
  responsible: string;
}

interface IActivityContent {
  id: string;
  title: string;
  activities: IActivity[];
}

interface IRow {
  id?: string; // identificador de la "actividad" o "proyecto"
  title: string;
  s1Actividad: string;
  s1Asistencia: string;
  s2Actividad: string;
  s2Asistencia: string;
  s3Actividad: string;
  s3Asistencia: string;
  s4Actividad: string;
  s4Asistencia: string;
}

const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvODU5ZHIxN0s0N2VFblJRc2diNyIsImVtYWlsIjoianVhbkBleGFtcGxlLmNvbSIsInJvbGVzIjoiQWRtaW4iLCJpYXQiOjE3NDIxNDM2MjF9.YsitldhlkNOvqt_NZxGph1uKEn23xvKE5yrLBm1gsCk'; // Ajusta tu token real
const BASE_URL = 'http://192.168.56.1:3000/letsHelp/Colombia/activities';
const USER_ID = '3514235900'; // ID o teléfono simulado

export default function DashboardPage() {
  // Paginación
  const [page, setPage] = useState(1);
  const handlePageChange = (_e: React.ChangeEvent<unknown>, val: number) => setPage(val);

  // programName, programId
  const [programName, setProgramName] = useState('Cargando...');
  const [programId, setProgramId] = useState<string>('');

  // subprograms, selectedSubprogram
  const [subprogramList, setSubprogramList] = useState<ISubprogram[]>([]);
  const [selectedSubprogram, setSelectedSubprogram] = useState<string>('');

  // Datos transformados para la tabla
  const [activitiesRows, setActivitiesRows] = useState<IRow[]>([]);

  // Estados para el modal
  const [openModal, setOpenModal] = useState(false);
  const [weekToEdit, setWeekToEdit] = useState<number>(0);
  const [editRowData, setEditRowData] = useState<IRow | null>(null);

  // 1. Obtiene la info del programa y subprogramas
  useEffect(() => {
    fetch(`${BASE_URL}/getPrograms/${USER_ID}`, {
      method: 'POST',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.code === 1 && data.content?.length > 0) {
          const program = data.content[0];
          setProgramName(program.name || 'Programa sin nombre');
          setProgramId(program.id);

          if (program.subprograms && program.subprograms.length > 0) {
            setSubprogramList(program.subprograms);
            setSelectedSubprogram(program.subprograms[0].id);
          } else {
            setSubprogramList([]);
            setSelectedSubprogram('');
          }
        } else {
          setProgramName('Programa no disponible');
        }
      })
      .catch((err) => {
        console.error('Error al obtener programa:', err);
        setProgramName('Error al cargar programa');
      });
  }, []);

  // 2. Función para obtener las actividades (segundo servicio)
  const fetchActivities = () => {
    if (!programId || !selectedSubprogram) {
      setActivitiesRows([]);
      return;
    }
    const url = `${BASE_URL}/activities-by-subprogram?programId=${programId}&subprogramId=${selectedSubprogram}`;
    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: TOKEN,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.code === 1 && Array.isArray(data.content)) {
          const transformed: IRow[] = data.content.map((item: IActivityContent) => {
            const row: any = {};
            row.id = item.id;
            row.title = item.title;

            for (let w = 1; w <= 4; w++) {
              const wd = item.activities.find((a) => a.weekNumber === w);
              if (wd) {
                row[`s${w}Actividad`] = `${wd.projectedActivities}/${wd.executedActivities}`;
                row[`s${w}Asistencia`] = `${wd.projectedAttendees}/${wd.actualAttendees}`;
              } else {
                row[`s${w}Actividad`] = '-/-';
                row[`s${w}Asistencia`] = '-/-';
              }
            }
            return row;
          });
          setActivitiesRows(transformed);
        } else {
          setActivitiesRows([]);
        }
      })
      .catch((err) => {
        console.error('Error al obtener actividades:', err);
        setActivitiesRows([]);
      });
  };

  // Llamamos a fetchActivities cuando cambie selectedSubprogram o programId
  useEffect(() => {
    fetchActivities();
  }, [programId, selectedSubprogram]);

  // Manejo del modal
  const handleOpenModal = (row: IRow, week: number) => {
    setEditRowData(row);
    setWeekToEdit(week);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditRowData(null);
    setWeekToEdit(0);
  };

  // Callback que se ejecuta al guardar la modal y hacer patch OK
  const handleSaved = () => {
    // Vuelve a cargar la tabla
    fetchActivities();
    // Cierra la modal
    handleCloseModal();
  };

  return (
    <SidebarLayout>
      <Typography variant="h4" fontWeight="bold" mb={1} sx={{ textAlign: 'center' }}>
        {programName}
      </Typography>

      {/* Select para subprograma */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Subprograma:
        </Typography>
        <Select
          variant="outlined"
          value={selectedSubprogram}
          onChange={(event) => setSelectedSubprogram(event.target.value as string)}
          size="small"
          sx={{ minWidth: 220 }}
        >
          {subprogramList.map((sp) => (
            <MenuItem key={sp.id} value={sp.id}>
              {sp.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Typography variant="h6" mb={2}>
        * Las actividades y asistencias se muestran de la forma: programadas / ejecutadas
      </Typography>

      <Paper sx={{ p: 2, overflow: 'auto' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  colSpan={13}
                  align="center"
                  sx={{
                    backgroundColor: '#29ABE2',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                  }}
                >
                  Actividades - Asistentes
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#f0f0f0',
                    width: 280,
                  }}
                >
                  Descripción de la actividad
                </TableCell>
                <TableCell colSpan={3} align="center" sx={{ backgroundColor: '#29ABE2', color: '#fff', fontWeight: 'bold' }}>
                  Semana 1
                </TableCell>
                <TableCell colSpan={3} align="center" sx={{ backgroundColor: '#29ABE2', color: '#fff', fontWeight: 'bold' }}>
                  Semana 2
                </TableCell>
                <TableCell colSpan={3} align="center" sx={{ backgroundColor: '#29ABE2', color: '#fff', fontWeight: 'bold' }}>
                  Semana 3
                </TableCell>
                <TableCell colSpan={3} align="center" sx={{ backgroundColor: '#29ABE2', color: '#fff', fontWeight: 'bold' }}>
                  Semana 4
                </TableCell>
              </TableRow>
              <TableRow>
                {/* Semana 1 */}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Activ.</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Asist.</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Editar</TableCell>
                {/* Semana 2 */}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Activ.</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Asist.</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Editar</TableCell>
                {/* Semana 3 */}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Activ.</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Asist.</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Editar</TableCell>
                {/* Semana 4 */}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Activ.</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Asist.</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Editar</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {activitiesRows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.title}</TableCell>

                  {/* Semana 1 */}
                  <TableCell align="center">{row.s1Actividad}</TableCell>
                  <TableCell align="center">{row.s1Asistencia}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenModal(row, 1)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  {/* Semana 2 */}
                  <TableCell align="center">{row.s2Actividad}</TableCell>
                  <TableCell align="center">{row.s2Asistencia}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenModal(row, 2)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  {/* Semana 3 */}
                  <TableCell align="center">{row.s3Actividad}</TableCell>
                  <TableCell align="center">{row.s3Asistencia}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenModal(row, 3)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  {/* Semana 4 */}
                  <TableCell align="center">{row.s4Actividad}</TableCell>
                  <TableCell align="center">{row.s4Asistencia}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenModal(row, 4)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {activitiesRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    No hay actividades para el subprograma seleccionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={20} page={page} onChange={handlePageChange} />
      </Box>

      {/* El modal se dibuja si tenemos un row y una semana */}
      {editRowData && weekToEdit > 0 && (
        <EditActivityModal
          open={openModal}
          onClose={handleCloseModal}
          onSaved={handleSaved} 
          rowData={editRowData}
          weekNumber={weekToEdit}
          programId={programId}
          subprogramId={selectedSubprogram}
        />
      )}
    </SidebarLayout>
  );
}
