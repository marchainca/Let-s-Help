'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

const TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || '';
const UPDATE_URL = `${process.env.NEXT_PUBLIC_ACTIVITIES_API_URL}${process.env.NEXT_PUBLIC_UPDATE_ACTIVITY_ENDPOINT}`;

interface EditActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  rowData: {
    id?: string;
    [key: string]: any;
  };
  weekNumber: number;
  programId: string;
  subprogramId: string;
}

export default function EditActivityModal(props: EditActivityModalProps) {
  const { open, onClose, onSaved, rowData, weekNumber, programId, subprogramId } = props;

  const [projectedActivities, setProjectedActivities] = useState<number>(0);
  const [executedActivities, setExecutedActivities] = useState<number>(0);
  const [projectedAttendees, setProjectedAttendees] = useState<number>(0);
  const [actualAttendees, setActualAttendees] = useState<number>(0);

  useEffect(() => {
    if (!rowData || !weekNumber) return;

    let sActividad = '';
    let sAsistencia = '';
    switch (weekNumber) {
      case 1:
        sActividad = rowData.s1Actividad || '0/0';
        sAsistencia = rowData.s1Asistencia || '0/0';
        break;
      case 2:
        sActividad = rowData.s2Actividad || '0/0';
        sAsistencia = rowData.s2Asistencia || '0/0';
        break;
      case 3:
        sActividad = rowData.s3Actividad || '0/0';
        sAsistencia = rowData.s3Asistencia || '0/0';
        break;
      case 4:
        sActividad = rowData.s4Actividad || '0/0';
        sAsistencia = rowData.s4Asistencia || '0/0';
        break;
    }

    const [projAct, execAct] = sActividad.split('/');
    const [projAtt, execAtt] = sAsistencia.split('/');

    setProjectedActivities(Number(projAct));
    setExecutedActivities(Number(execAct));
    setProjectedAttendees(Number(projAtt));
    setActualAttendees(Number(execAtt));
  }, [rowData, weekNumber]);

  const handleSave = () => {
    if (!rowData.id) return;

    fetch(UPDATE_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId,
        subprogramId,
        activityId: rowData.id,
        projectedActivities,
        executedActivities,
        projectedAttendees,
        actualAttendees,
        weekNumber,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(() => {
        // Éxito => invocamos onSaved() para recargar la tabla en page.tsx
        onSaved();
      })
      .catch((err) => {
        console.error('Error al actualizar actividad:', err);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Actividad (Semana {weekNumber})</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Actividades Proyectadas"
            type="number"
            value={projectedActivities}
            onChange={(e) => setProjectedActivities(Number(e.target.value))}
            fullWidth
          />
          <TextField
            label="Actividades Ejecutadas"
            type="number"
            value={executedActivities}
            onChange={(e) => setExecutedActivities(Number(e.target.value))}
            fullWidth
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Asistentes Proyectados"
            type="number"
            value={projectedAttendees}
            onChange={(e) => setProjectedAttendees(Number(e.target.value))}
            fullWidth
          />
          <TextField
            label="Asistentes Reales"
            type="number"
            value={actualAttendees}
            onChange={(e) => setActualAttendees(Number(e.target.value))}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
