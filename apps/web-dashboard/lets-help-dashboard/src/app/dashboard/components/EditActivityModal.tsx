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
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import params from '@/params';
import { withAcceptLanguage } from '@/lib/apiHeaders';
import { ActivityTableRow, formatExecutionDate } from '@/lib/activitiesUtils';

const UPDATE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}${params.paths.updateActivity}`;

function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') || process.env.NEXT_PUBLIC_AUTH_TOKEN || '';
}

interface EditActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  rowData: ActivityTableRow;
  programId: string;
  subprogramId: string;
}

export default function EditActivityModal(props: EditActivityModalProps) {
  const { t, i18n } = useTranslation();
  const { open, onClose, onSaved, rowData, programId, subprogramId } = props;

  const [projectedActivities, setProjectedActivities] = useState<number>(0);
  const [executedActivities, setExecutedActivities] = useState<number>(0);
  const [projectedAttendees, setProjectedAttendees] = useState<number>(0);
  const [actualAttendees, setActualAttendees] = useState<number>(0);

  useEffect(() => {
    if (!rowData) return;

    setProjectedActivities(rowData.projectedActivities);
    setExecutedActivities(rowData.executedActivities);
    setProjectedAttendees(rowData.projectedAttendees);
    setActualAttendees(rowData.actualAttendees);
  }, [rowData]);

  const handleSave = () => {
    if (!rowData.id) return;

    fetch(UPDATE_URL, {
      method: 'PATCH',
      headers: withAcceptLanguage({
        Authorization: getAuthToken(),
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        programId,
        subprogramId,
        activityId: rowData.id,
        projectedActivities,
        executedActivities,
        projectedAttendees,
        actualAttendees,
        weekNumber: rowData.weekNumber,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(() => {
        onSaved();
      })
      .catch((err) => {
        console.error('Error al actualizar actividad:', err);
      });
  };

  const executionDateLabel = formatExecutionDate(
    rowData.executionDate,
    i18n.language,
    t('dashboard.activitiesPage.noExecutionDate')
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('dashboard.editActivityModal.title')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {rowData.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('dashboard.editActivityModal.executionDateLabel', { date: executionDateLabel })}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label={t('dashboard.editActivityModal.projectedActivities')}
            type="number"
            value={projectedActivities}
            onChange={(e) => setProjectedActivities(Number(e.target.value))}
            fullWidth
          />
          <TextField
            label={t('dashboard.editActivityModal.executedActivities')}
            type="number"
            value={executedActivities}
            onChange={(e) => setExecutedActivities(Number(e.target.value))}
            fullWidth
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label={t('dashboard.editActivityModal.projectedAttendees')}
            type="number"
            value={projectedAttendees}
            onChange={(e) => setProjectedAttendees(Number(e.target.value))}
            fullWidth
          />
          <TextField
            label={t('dashboard.editActivityModal.actualAttendees')}
            type="number"
            value={actualAttendees}
            onChange={(e) => setActualAttendees(Number(e.target.value))}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('dashboard.common.cancel')}</Button>
        <Button variant="contained" onClick={handleSave}>
          {t('dashboard.common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
