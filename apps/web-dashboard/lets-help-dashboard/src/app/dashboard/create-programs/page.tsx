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
import { useTranslation } from 'react-i18next';
import SidebarLayout from '../components/SidebarLayout';
import params from '@/params';
import { withAcceptLanguage } from '@/lib/apiHeaders';

const TOKEN = localStorage.getItem('accessToken') || '';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const USER = localStorage.getItem('userData') || '';
const USER_ID = USER ? JSON.parse(USER).idNumber : '';

interface IProgram {
  id: string;
  name: string;
  description?: string;
  subprograms?: Array<{ id: string; name: string }>;
}

export default function CreateProgramsPage() {
  const { t, i18n } = useTranslation();

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
  const [actExecutionDate, setActExecutionDate] = useState('');
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

  const reloadPage = () => {
    window.location.reload();
  };

  const loadPrograms = () =>
    fetch(`${BASE_URL}${params.paths.getPrograms}/${USER_ID}`, {
      method: 'POST',
      headers: withAcceptLanguage({
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      }),
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
        console.error('Error al obtener programas existentes:', err);
        setPrograms([]);
      });

  useEffect(() => {
    void loadPrograms();
  }, [i18n.language]);

  // 2. Crear Programa
  const handleCreateProgram = () => {
    fetch(`${BASE_URL}${params.paths.createProgram}`, {
      method: 'POST',
      headers: withAcceptLanguage({
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      }),
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
        if (data.code != null && data.code !== 1) {
          throw new Error(data.message || 'Error al crear programa');
        }
        reloadPage();
      })
      .catch((err) => {
        console.error('Error al crear programa:', err);
      });
  };

  // 3. Crear Subprograma
  const handleCreateSubprogram = () => {
    if (!selectedProgramForSub) {
      alert(t('dashboard.createPrograms.selectProgramForSubprogram'));
      return;
    }
    fetch(`${BASE_URL}${params.paths.createSubprogram}`, {
      method: 'POST',
      headers: withAcceptLanguage({
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      }),
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
        if (data.code != null && data.code !== 1) {
          throw new Error(data.message || 'Error al crear subprograma');
        }
        reloadPage();
      })
      .catch((err) => {
        console.error('Error al crear subprograma:', err);
      });
  };

  // 4. Crear Actividad
  const handleCreateActivity = () => {
    if (!selectedProgramForAct || !selectedSubprogForAct) {
      alert(t('dashboard.createPrograms.selectProgramAndSubprogramForActivity'));
      return;
    }
    if (!actExecutionDate) {
      alert(t('dashboard.createPrograms.executionDateRequired'));
      return;
    }
    fetch(`${BASE_URL}${params.paths.createActivity}`, {
      method: 'POST',
      headers: withAcceptLanguage({
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        programId: selectedProgramForAct,
        subprogramId: selectedSubprogForAct,
        activityData: {
          title: newActTitle,
          executionDate: actExecutionDate,
          responsible: actResponsible,
          projectedActivities: actProjActivities,
          executedActivities: actExecActivities,
          projectedAttendees: actProjAttendees,
          actualAttendees: actExecAttendees,
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
        if (data.code != null && data.code !== 1) {
          throw new Error(data.message || 'Error al crear actividad');
        }
        reloadPage();
      })
      .catch((err) => {
        console.error('Error al crear actividad:', err);
      });
  };

  return (
    <SidebarLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          {t('dashboard.createPrograms.pageTitle')}
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
              {t('dashboard.createPrograms.createProgram')}
            </Typography>
            <TextField
              label={t('dashboard.createPrograms.programName')}
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
            />
            <TextField
              label={t('dashboard.common.description')}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              sx={{ mb: 2 }}
              value={newProgramDesc}
              onChange={(e) => setNewProgramDesc(e.target.value)}
            />
            <Button variant="contained" onClick={handleCreateProgram}>
              {t('dashboard.createPrograms.saveProgram')}
            </Button>
          </Paper>

          {/* Form para crear Subprograma */}
          <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {t('dashboard.createPrograms.createSubprogram')}
            </Typography>

            <Select
              fullWidth
              sx={{ mb: 2 }}
              displayEmpty
              value={selectedProgramForSub}
              onChange={(e) => setSelectedProgramForSub(e.target.value)}
            >
              <MenuItem value="">{t('dashboard.createPrograms.selectProgram')}</MenuItem>
              {programs.map((prog) => (
                <MenuItem key={prog.id} value={prog.id}>
                  {prog.name}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label={t('dashboard.createPrograms.subprogramName')}
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={newSubprogramName}
              onChange={(e) => setNewSubprogramName(e.target.value)}
            />
            <TextField
              label={t('dashboard.common.description')}
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              sx={{ mb: 2 }}
              value={newSubprogramDesc}
              onChange={(e) => setNewSubprogramDesc(e.target.value)}
            />
            <Button variant="contained" onClick={handleCreateSubprogram}>
              {t('dashboard.createPrograms.saveSubprogram')}
            </Button>
          </Paper>

          {/* Form para crear Actividad */}
          <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {t('dashboard.createPrograms.createActivity')}
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
              <MenuItem value="">{t('dashboard.createPrograms.selectProgram')}</MenuItem>
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
                  <MenuItem value="">{t('dashboard.createPrograms.selectSubprogram')}</MenuItem>
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
                    {t('dashboard.createPrograms.noSubprogramsWarning')}
                  </Typography>
                )}
              </>
            )}

            {/* Datos de la Actividad */}
            <TextField
              label={t('dashboard.createPrograms.activityTitle')}
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={newActTitle}
              onChange={(e) => setNewActTitle(e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label={t('dashboard.createPrograms.executionDate')}
                type="date"
                fullWidth
                variant="outlined"
                value={actExecutionDate}
                onChange={(e) => setActExecutionDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label={t('dashboard.createPrograms.responsibleUserId')}
                fullWidth
                variant="outlined"
                value={actResponsible}
                onChange={(e) => setActResponsible(e.target.value)}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label={t('dashboard.createPrograms.projectedActivitiesShort')}
                type="number"
                fullWidth
                variant="outlined"
                value={actProjActivities}
                onChange={(e) => setActProjActivities(Number(e.target.value))}
              />
              <TextField
                label={t('dashboard.createPrograms.executedActivitiesShort')}
                type="number"
                fullWidth
                variant="outlined"
                value={actExecActivities}
                onChange={(e) => setActExecActivities(Number(e.target.value))}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label={t('dashboard.createPrograms.projectedAttendeesShort')}
                type="number"
                fullWidth
                variant="outlined"
                value={actProjAttendees}
                onChange={(e) => setActProjAttendees(Number(e.target.value))}
              />
              <TextField
                label={t('dashboard.createPrograms.actualAttendeesShort')}
                type="number"
                fullWidth
                variant="outlined"
                value={actExecAttendees}
                onChange={(e) => setActExecAttendees(Number(e.target.value))}
              />
            </Box>

            <Button variant="contained" onClick={handleCreateActivity}>
              {t('dashboard.createPrograms.saveActivity')}
            </Button>
          </Paper>
        </Box>
      </Box>
    </SidebarLayout>
  );
}
