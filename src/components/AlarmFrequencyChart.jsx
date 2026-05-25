import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Box, Typography, Skeleton, Select, MenuItem, FormControl } from '@mui/material';
import { fetchAlarmFrequency } from '../services/api';
import { COLORS } from '../theme/colors';

const RANGE_OPTIONS = [
  { value: '30m',  label: '30 MIN' },
  { value: '1h',   label: '1 HOUR' },
  { value: '6h',   label: '6 HOURS' },
  { value: '24h',  label: '24 HOURS' },
  { value: '168h', label: '7 DAYS' },
  { value: '336h', label: '14 DAYS'}
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, p: 1.5, borderRadius: 0 }}>
        <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', mb: 0.5 }}>
          SOURCE: {payload[0].payload.name}
        </Typography>
        <Typography sx={{ color: COLORS.critical, fontFamily: '"Roboto Mono", monospace', fontSize: '1.1rem', fontWeight: 700 }}>
          FREQ: {payload[0].value}
        </Typography>
      </Box>
    );
  }
  return null;
};

const AlarmFrequencyChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('1h');

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const result = await fetchAlarmFrequency({ range, limit: 5 });
        if (!cancelled) setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    const id = setInterval(loadData, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [range]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0, flexShrink: 0 }}>
        <FormControl size="small">
          <Select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            sx={{
              fontFamily: '"Roboto Mono", monospace',
              fontSize: '0.7rem',
              color: COLORS.text,
              bgcolor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 0,
              minWidth: 100,
              '.MuiOutlinedInput-notchedOutline': { border: 'none' },
              '.MuiSvgIcon-root': { color: COLORS.textMuted },
            }}
            MenuProps={{
              PaperProps: { sx: { bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 0 } },
            }}
          >
            {RANGE_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.value}
                value={opt.value}
                sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem', color: COLORS.text }}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Skeleton variant="rectangular" sx={{ borderRadius: 0, bgcolor: COLORS.surface, flexGrow: 1, minHeight: 0 }} />
      ) : (
      <Box sx={{ width: '100%', flexGrow: 1, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={COLORS.border} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: '"Roboto Mono", monospace' }}
            width={100}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(248, 81, 73, 0.08)' }} />
          <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={18}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.critical : COLORS.warn} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </Box>
      )}
    </Box>
  );
};

export default AlarmFrequencyChart;