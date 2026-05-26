import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, MenuItem, Alert
} from '@mui/material';
import { fetchLocations, createSensor } from '../services/api';
import { COLORS } from '../theme/colors';

const initialForm = {
  name: '',
  sensorNo: '',
  locationId: '',
  unit: '°C',
  lowerLimit: '',
  upperLimit: '',
};

const UNIT_OPTIONS = ['°C', '%', 'Mbps', 'ms', 'V', 'A'];

const AddDeviceModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [locations, setLocations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchLocations().then((list) => {
      if (cancelled) return;
      setLocations(list);
      if (list.length && !form.locationId) {
        setForm((f) => ({ ...f, locationId: list[0].id }));
      }
    });
    return () => { cancelled = true; };
  }, [open]);


  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim() || !form.sensorNo.trim() || !form.locationId) {
      setError('Name, Sensor No, and Location are required');
      return;
    }
    setSubmitting(true);
    const result = await createSensor(form);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message || 'Create failed');
      return;
    }
    onCreated?.(result.sensor);
    onClose();
  };

  const fieldSx = {
    '& .MuiInputBase-root': {
      bgcolor: COLORS.surface,
      borderRadius: 0,
      color: COLORS.text,
      fontFamily: '"Roboto Mono", monospace',
      fontSize: '0.85rem',
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
    '& .MuiInputLabel-root': {
      color: COLORS.textMuted,
      fontFamily: '"Roboto Mono", monospace',
      fontSize: '0.75rem',
      letterSpacing: '1px',
    },
    '& .MuiSvgIcon-root': { color: COLORS.textMuted },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 0,
          color: COLORS.text,
        },
      }}
    >
      <DialogTitle sx={{
        fontFamily: '"Georgia", serif',
        fontStyle: 'italic',
        color: COLORS.text,
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        Add New Device
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="NAME"
            value={form.name}
            onChange={handleChange('name')}
            required
            fullWidth
            sx={fieldSx}
          />
          <TextField
            label="SENSOR NO (e.g. SN-007)"
            value={form.sensorNo}
            onChange={handleChange('sensorNo')}
            required
            fullWidth
            sx={fieldSx}
          />
          <TextField
            select
            label="LOCATION"
            value={form.locationId}
            onChange={handleChange('locationId')}
            required
            fullWidth
            sx={fieldSx}
          >
            {locations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}
                sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
                {loc.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="UNIT"
            value={form.unit}
            onChange={handleChange('unit')}
            fullWidth
            sx={fieldSx}
          >
            {UNIT_OPTIONS.map((u) => (
              <MenuItem key={u} value={u}
                sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem' }}>
                {u}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="LOWER LIMIT"
              type="number"
              value={form.lowerLimit}
              onChange={handleChange('lowerLimit')}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="UPPER LIMIT"
              type="number"
              value={form.upperLimit}
              onChange={handleChange('upperLimit')}
              fullWidth
              sx={fieldSx}
            />
          </Box>

          {error && (
            <Alert severity="error" variant="outlined"
              sx={{
                bgcolor: COLORS.surface,
                borderColor: COLORS.critical,
                color: COLORS.text,
                borderRadius: 0,
                '& .MuiAlert-icon': { color: COLORS.critical },
              }}>
              <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                {error}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: `1px solid ${COLORS.border}`, p: 2 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            borderRadius: 0,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            fontFamily: '"Roboto Mono", monospace',
            fontWeight: 700,
            letterSpacing: '1px',
            '&:hover': { borderColor: COLORS.textMuted, bgcolor: 'transparent' },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            borderRadius: 0,
            bgcolor: COLORS.info,
            color: COLORS.bg,
            fontFamily: '"Roboto Mono", monospace',
            fontWeight: 700,
            letterSpacing: '1px',
            '&:hover': { bgcolor: COLORS.info },
          }}
        >
          {submitting ? 'CREATING...' : 'CREATE'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDeviceModal;
