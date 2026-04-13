'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import SidebarLayout from '../components/SidebarLayout';

// Ajusta tu token real y los endpoints si difieren
const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvODU5ZHIxN0s0N2VFblJRc2diNyIsImVtYWlsIjoianVhbkBleGFtcGxlLmNvbSIsInJvbGVzIjoiQWRtaW4iLCJpYXQiOjE3NDIxNDM2MjF9.YsitldhlkNOvqt_NZxGph1uKEn23xvKE5yrLBm1gsCk';
const BASE_URL = 'http://192.168.56.1:3000/letsHelp/Colombia/activities';

interface IProgram {
  id: string;
  name: string;
  description?: string;
  subprograms?: Array<{ id: string; name: string }>;
}

export default function CreateProgramsPage() {
  // Lista de programas existentes
  const [programs, setPrograms] = useState<IProgram[]>([]);

  // Estados para crear un nuevo programa
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDesc, setNewProgramDesc] = useState('');

  // Estados para crear un subprograma
  const [selectedProgramForSub, setSelectedProgramForSub] = useState('');
  const [newSubprogramName, setNewSubprogramName] = useState('');
  const [newSubprogramDesc, setNewSubprogramDesc] = useState('');

  // Estados para crear una actividad
  const [selectedProgramForAct, setSelectedProgramForAct] = useState('');
  const [selectedSubprogForAct, setSelectedSubprogForAct] = useState('');
  const [newActTitle, setNewActTitle] = useState('');
  const [actWeekNumber, setActWeekNumber] = useState<number>(1);
  const [actProjActivities, setActProjActivities] = useState<number>(0);
  const [actExecActivities, setActExecActivities] = useState<number>(0);
  const [actProjAttendees, setActProjAttendees] = useState<number>(0);
  const [actExecAttendees, setActExecAttendees] = useState<number>(0);
  const [actResponsible, setActResponsible] = useState<string>('');

  // Al montar, obtener el idNumber del usuario de localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData && userData.idNumber) {
            setActResponsible(userData.idNumber);
          }
        } catch (e) {
          // Si hay error de parseo, dejar vacío
          setActResponsible('');
        }
      }
    }
  }, []);

  // 1. Al montar, cargamos la lista de programas
  useEffect(() => {
    fetch(`${BASE_URL}/getPrograms/3514235900`, {
      method: 'POST',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.code === 1 && data.content?.length > 0) {
          setPrograms(data.content); // array de programas
        } else {
          setPrograms([]);
        }
      })
      .catch((err) => {
        console.error('Error al obtener programas existentes:', err);
        setPrograms([]);
      });
  }, []);

  // 2. Crear Programa
  const handleCreateProgram = () => {
    fetch(`${BASE_URL}/createProgram`, {
      method: 'POST',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newProgramName,
        description: newProgramDesc,
        responsible: actResponsible,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Programa creado:', data);
        // Opcional: recargar la lista de programas
        //reloadPrograms();
        // Limpiar el formulario
        setNewProgramName('');
        setNewProgramDesc('');
      })
      .catch((err) => {
        console.error('Error al crear programa:', err);
      });
  };

  // Función para recargar la lista de programas
  /* const reloadPrograms = () => {
    fetch(`${BASE_URL}/getPrograms/3514235900`, {
      method: 'POST',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.code === 1 && data.content?.length > 0) {
          setPrograms(data.content);
        } else {
          setPrograms([]);
        }
      })
      .catch((err) => {
        console.error('Error al recargar programas:', err);
        setPrograms([]);
      });
  }; */

  // 3. Crear Subprograma
  const handleCreateSubprogram = () => {
    if (!selectedProgramForSub) {
      alert('Selecciona un programa para crear el subprograma');
      return;
    }
    fetch(`${BASE_URL}/createSubprogram`, {
      method: 'POST',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: selectedProgramForSub,
        name: newSubprogramName,
        description: newSubprogramDesc,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Subprograma creado:', data);
        // Recargar programas (para ver el nuevo subprograma)
        //reloadPrograms();
        // Limpiar formulario
        setNewSubprogramName('');
        setNewSubprogramDesc('');
        setSelectedProgramForSub('');
      })
      .catch((err) => {
        console.error('Error al crear subprograma:', err);
      });
  };

  // 4. Crear Actividad
  const handleCreateActivity = () => {
    if (!selectedProgramForAct || !selectedSubprogForAct) {
      alert('Selecciona un programa y subprograma para crear la actividad');
      return;
    }
    fetch(`${BASE_URL}/createActivity`, {
      method: 'POST',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: selectedProgramForAct,
        subprogramId: selectedSubprogForAct,
        activityData: {
          title: newActTitle,
          weekNumber: actWeekNumber,
          projectedActivities: actProjActivities,
          executedActivities: actExecActivities,
          projectedAttendees: actProjAttendees,
          actualAttendees: actExecAttendees,
          responsible: actResponsible,
        },
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Actividad creada:', data);
        // Limpiar formulario
        setNewActTitle('');
        setActWeekNumber(1);
        setActProjActivities(0);
        setActExecActivities(0);
        setActProjAttendees(0);
        setActExecAttendees(0);
        setActResponsible(actResponsible);
        setSelectedProgramForAct('');
        setSelectedSubprogForAct('');
        // Opcional: recargar o mostrar en otra lista
      })
      .catch((err) => {
        console.error('Error al crear actividad:', err);
      });
  };

  return (
    <SidebarLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Crear Programas, Subprogramas y Actividades
        </Typography>

        {/* Lista de programas existentes */}
        {/* <Paper sx={{ p: 2, mb: 3 }}> */}
          {/* <Typography variant="h6" fontWeight="bold" mb={1}>
            Programas Existentes
          </Typography> */}
          {/* {programs.length === 0 && (
            <Typography>No hay programas registrados aún.</Typography>
          )} */}
          {/* {programs.map((prog) => (
            <Box key={prog.id} sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>{prog.name}</strong> - {prog.description}
              </Typography>
              {prog.subprograms && prog.subprograms.length > 0 && (
                <ul>
                  {prog.subprograms.map((sp) => (
                    <li key={sp.id}>{sp.name}</li>
                  ))}
                </ul>
              )}
              <Divider sx={{ my: 1 }} />
            </Box>
          ))} */}
       {/*  </Paper> */}

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Form para crear Programa */}
          <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Crear Programa
            </Typography>
            <TextField
              label="Nombre del Programa"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
            />
            <TextField
              label="Descripción"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              sx={{ mb: 2 }}
              value={newProgramDesc}
              onChange={(e) => setNewProgramDesc(e.target.value)}
            />
            <Button variant="contained" onClick={handleCreateProgram}>
              Guardar Programa
            </Button>
          </Paper>

          {/* Form para crear Subprograma */}
          <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Crear Subprograma
            </Typography>

            <Select
              fullWidth
              sx={{ mb: 2 }}
              displayEmpty
              value={selectedProgramForSub}
              onChange={(e) => setSelectedProgramForSub(e.target.value)}
            >
              <MenuItem value="">Selecciona un programa</MenuItem>
              {programs.map((prog) => (
                <MenuItem key={prog.id} value={prog.id}>
                  {prog.name}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Nombre del Subprograma"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={newSubprogramName}
              onChange={(e) => setNewSubprogramName(e.target.value)}
            />
            <TextField
              label="Descripción"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              sx={{ mb: 2 }}
              value={newSubprogramDesc}
              onChange={(e) => setNewSubprogramDesc(e.target.value)}
            />
            <Button variant="contained" onClick={handleCreateSubprogram}>
              Guardar Subprograma
            </Button>
          </Paper>

          {/* Form para crear Actividad */}
          <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Crear Actividad
            </Typography>

            {/* Seleccionar Programa */}
            <Select
              fullWidth
              sx={{ mb: 2 }}
              displayEmpty
              value={selectedProgramForAct}
              onChange={(e) => {
                setSelectedProgramForAct(e.target.value);
                setSelectedSubprogForAct(''); // Limpiar subprograma al cambiar programa
              }}
            >
              <MenuItem value="">Selecciona un programa</MenuItem>
              {programs.map((prog) => (
                <MenuItem key={prog.id} value={prog.id}>
                  {prog.name}
                </MenuItem>
              ))}
            </Select>

            {/* Seleccionar Subprograma */}
            {selectedProgramForAct && (
              <>
                <Select
                  fullWidth
                  sx={{ mb: 2 }}
                  displayEmpty
                  value={selectedSubprogForAct}
                  onChange={(e) => setSelectedSubprogForAct(e.target.value)}
                  disabled={
                    !programs.find((p) => p.id === selectedProgramForAct)?.subprograms?.length
                  }
                >
                  <MenuItem value="">Selecciona un subprograma</MenuItem>
                  {programs
                    .find((p) => p.id === selectedProgramForAct)
                    ?.subprograms?.map((sp) => (
                      <MenuItem key={sp.id} value={sp.id}>
                        {sp.name}
                      </MenuItem>
                    ))}
                </Select>
                {/* Mensaje visual si no hay subprogramas */}
                {programs.find((p) => p.id === selectedProgramForAct)?.subprograms?.length === 0 && (
                  <Typography color="warning.main" variant="body2" sx={{ mb: 2 }}>
                    El programa seleccionado no tiene subprogramas registrados.
                  </Typography>
                )}
              </>
            )}

            {/* Datos de la Actividad */}
            <TextField
              label="Título de la Actividad"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={newActTitle}
              onChange={(e) => setNewActTitle(e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Semana"
                type="number"
                fullWidth
                variant="outlined"
                value={actWeekNumber}
                onChange={(e) => setActWeekNumber(Number(e.target.value))}
              />
              <TextField
                label="Resp. (userId)"
                fullWidth
                variant="outlined"
                value={actResponsible}
                onChange={(e) => setActResponsible(e.target.value)}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Activ. Proy."
                type="number"
                fullWidth
                variant="outlined"
                value={actProjActivities}
                onChange={(e) => setActProjActivities(Number(e.target.value))}
              />
              <TextField
                label="Activ. Ejec."
                type="number"
                fullWidth
                variant="outlined"
                value={actExecActivities}
                onChange={(e) => setActExecActivities(Number(e.target.value))}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Asist. Proy."
                type="number"
                fullWidth
                variant="outlined"
                value={actProjAttendees}
                onChange={(e) => setActProjAttendees(Number(e.target.value))}
              />
              <TextField
                label="Asist. Reales"
                type="number"
                fullWidth
                variant="outlined"
                value={actExecAttendees}
                onChange={(e) => setActExecAttendees(Number(e.target.value))}
              />
            </Box>

            <Button variant="contained" onClick={handleCreateActivity}>
              Guardar Actividad
            </Button>
          </Paper>
        </Box>
      </Box>
    </SidebarLayout>
  );
}
