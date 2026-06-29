import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Skeleton, Alert, Button, Menu, MenuItem, Autocomplete, TextField } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchChartDataStatus, fetchDevices } from '../services/api';
import { COLORS } from '../theme/colors';

const RANGE_PRESETS = [
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '1y', value: '365d' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad2 = (n) => String(n).padStart(2, '0');
const DAY_MS = 86400000;

// Adaptive axis label: granularity follows the visible span (Grafana-style).
//   span <= ~1.5 days  -> HH:MM
//   span <= ~60 days   -> DD MMM
//   else               -> MMM YYYY
const makeAxisFormatter = (spanMs) => {
  if (spanMs > 60 * DAY_MS) {
    return (t) => { const d = new Date(t); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
  }
  if (spanMs > 1.5 * DAY_MS) {
    return (t) => { const d = new Date(t); return `${pad2(d.getDate())} ${MONTHS[d.getMonth()]}`; };
  }
  return (t) => { const d = new Date(t); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
};

// Tooltip always shows the full date + time.
const formatFull = (t) => {
  const d = new Date(t);
  return `${pad2(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

// Target number of points the chart renders, regardless of range. Backend
// downsamples to ~this many via time_bucket, so payload stays bounded even for
// 7d of high-cadence data. ~300 is plenty for a smooth line at typical widths.
const MAX_POINTS = 300;

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: COLORS.surface, border: '1px solid', borderColor: COLORS.border, p: 1.5, borderRadius: 0 }}>
        <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', marginBottom: 1, letterSpacing: '1px' }}>
          {typeof label === 'number' ? formatFull(label) : label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} sx={{ color: entry.color, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', fontWeight: 700, marginBottom: 0.5 }}>
            {entry.name || 'VALUE'}: {Number(entry.value).toFixed(2)}{unit}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};


const ChartWidget = ({ range = '1h', onRangeChange, onSensorChange, refreshMs = 5000 } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rangeAnchor, setRangeAnchor] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [sensorId, setSensorId] = useState(1);

  // Load sensor list once for the dropdown
  useEffect(() => {
    let cancelled = false;
    fetchDevices().then((list) => {
      if (cancelled) return;
      setSensors(list);
      if (list.length > 0 && !list.find((s) => s.id === sensorId)) {
        setSensorId(list[0].id);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const selectedSensor = sensors.find((s) => s.id === sensorId);
  const sensorName = selectedSensor?.name || `Sensor ${sensorId}`;
  const unit = selectedSensor?.unit || '';
  const seriesLabel = sensorName.toUpperCase();

  // Tell the parent (Dashboard) which sensor is selected, so its SENSOR ID card
  // stays in sync. Runs after render whenever the selection or the list changes.
  useEffect(() => {
    if (selectedSensor && typeof onSensorChange === 'function') {
      onSensorChange(selectedSensor);
    }
  }, [sensorId, sensors, onSensorChange]);

  const currentRange =
    RANGE_PRESETS.find((p) => p.value === range)?.label || String(range || 'all');

  // Span of the loaded data drives axis label granularity (auto-adapts).
  const spanMs = data.length > 1 ? data[data.length - 1].t - data[0].t : 0;
  const axisFormatter = makeAxisFormatter(spanMs);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const res = await fetchChartDataStatus({ sensorId, range, maxPoints: MAX_POINTS });
        if (cancelled) return;
        if (!res.ok) {
          setError(res);
          setData([]);
          return;
        }
        setError(null);
        setData(res.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    const id = setInterval(loadData, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sensorId, range, refreshMs]);

  if (loading) {
    return <Skeleton variant="rectangular" sx={{ borderRadius: 0, bgcolor: COLORS.surface, height: '100%', minHeight: 0 }} />;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 0,
        bgcolor: COLORS.surface,
        borderColor: COLORS.border,
        p: 1.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexShrink: 0 }}>

        
        <Typography sx={{ 
          color: COLORS.text, 
          fontFamily: '"Georgia", serif', 
          // fontStyle: 'italic', 
          fontSize: '1.25rem' }}>
          Thermal Metrics
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Autocomplete
            size="small"
            options={sensors}
            getOptionLabel={(s) => s?.name || ''}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={sensors.find((s) => s.id === sensorId) || null}
            onChange={(_, v) => v && setSensorId(v.id)}
            disableClearable
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="SENSOR"
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: COLORS.surface,
                    borderRadius: 0,
                    color: COLORS.text,
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.75rem',
                    py: 0,
                  },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
                  '& .MuiSvgIcon-root': { color: COLORS.textMuted },
                }}
              />
            )}
            ListboxProps={{
              sx: {
                bgcolor: COLORS.surface,
                border: '1px solid #2A2A2A',
                color: COLORS.text,
                fontFamily: '"Roboto Mono", monospace',
                fontSize: '0.75rem',
              },
            }}
            sx={{ width: 180 }}
          />
          <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', letterSpacing: '1px' }}>
            UNIT: {unit || '—'}
          </Typography>
          <Button
            size="small"
            onClick={(e) => setRangeAnchor(e.currentTarget)}
            sx={{
              borderRadius: 0,
              border: '1px solid #2A2A2A',
              color: COLORS.info,
              fontFamily: '"Roboto Mono", monospace',
              fontSize: '0.7rem',
              letterSpacing: '1px',
              px: 1.25,
              minWidth: 0,
              '&:hover': { borderColor: COLORS.border, bgcolor: 'rgba(88,166,255,0.08)' }
            }}
          >
            RANGE: {currentRange}
          </Button>
          <Menu
            anchorEl={rangeAnchor}
            open={Boolean(rangeAnchor)}
            onClose={() => setRangeAnchor(null)}
            PaperProps={{
              sx: {
                borderRadius: 0,
                bgcolor: COLORS.surface,
                border: '1px solid #2A2A2A',
                mt: 1,
                minWidth: 120,
              }
            }}
          >
            {RANGE_PRESETS.map((p) => (
              <MenuItem
                key={p.value}
                selected={p.value === range}
                onClick={() => {
                  onRangeChange?.(p.value);
                  setRangeAnchor(null);
                }}
                sx={{
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.75rem',
                  color: p.value === range ? COLORS.info : COLORS.text,
                  '&.Mui-selected': { bgcolor: 'rgba(88,166,255,0.12)' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                }}
              >
                {p.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {error ? (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            borderRadius: 0,
            bgcolor: COLORS.surface,
            borderColor: COLORS.border,
            color: COLORS.text,
            '& .MuiAlert-icon': { color: COLORS.critical },
            '& .MuiAlert-message': { width: '100%' },
          }}
          action={
            <Button
              size="small"
              onClick={() => {
                setLoading(true);
                // Trigger immediate reload by resetting loading; effect interval will also keep it fresh.
                // eslint-disable-next-line no-void
                void (async () => {
                  const res = await fetchChartDataStatus({ sensorId, range, maxPoints: MAX_POINTS });
                  if (!res.ok) {
                    setError(res);
                    setData([]);
                  } else {
                    setError(null);
                    setData(res.data || []);
                  }
                  setLoading(false);
                })();
              }}
              sx={{
                color: COLORS.info,
                borderRadius: 0,
                border: '1px solid #2A2A2A',
                minWidth: 0,
                px: 1.25,
                '&:hover': { borderColor: COLORS.border },
              }}
            >
              Retry
            </Button>
          }
        >
          <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.80rem' }}>
            Failed to load readings {error?.status ? `(HTTP ${error.status})` : ''}: {error?.message || 'Unknown error'}
          </Typography>
          <Typography sx={{ mt: 1, color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>
            Check that the API is running and `/readings` is available.
          </Typography>
        </Alert>
      ) : data.length === 0 ? (
        <Alert
          severity="info"
          variant="outlined"
          sx={{
            borderRadius: 0,
            bgcolor: COLORS.surface,
            borderColor: COLORS.border,
            color: COLORS.text,
            '& .MuiAlert-icon': { color: COLORS.info },
          }}
        >
          <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.80rem' }}>
            No readings yet.
          </Typography>
        </Alert>
      ) : null}

      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.info} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLORS.info} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} strokeOpacity={0.5} />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={axisFormatter}
              tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: '"Roboto Mono", monospace' }}
              axisLine={false}
              tickLine={false}
              dy={10}
              interval="preserveStartEnd"
              minTickGap={56}
            />
            <YAxis
              tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: '"Roboto Mono", monospace' }}
              axisLine={false}
              tickLine={false}
              width={56}
              domain={['dataMin - 5', 'dataMax + 5']}
              allowDecimals={false}
              tickFormatter={(val) => `${Math.round(val)}${unit}`}
            />
            <Tooltip
              content={<CustomTooltip unit={unit} seriesName={seriesLabel} />}
              cursor={{ stroke: COLORS.info, strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.5 }}
            />
            <Legend
              wrapperStyle={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', color: COLORS.textMuted, paddingTop: '10px' }}
              iconType="plainline"
            />
            <Area
              type="monotone"
              dataKey="cpu"
              name={seriesLabel}
              stroke={COLORS.info}
              strokeWidth={2}
              fill="url(#chartFill)"
              dot={false}
              activeDot={{ r: 4, fill: COLORS.info, stroke: COLORS.surface, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ChartWidget;