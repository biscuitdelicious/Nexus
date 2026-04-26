import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Skeleton, Alert, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchChartDataStatus } from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: '#0D0D0D', border: '1px solid #2A2A2A', p: 1.5, borderRadius: 0 }}>
        <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', mb: 1, letterSpacing: '1px' }}>
          TIME: {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} sx={{ color: entry.color, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', fontWeight: 700, mb: 0.5 }}>
            {entry.name}: {entry.value}°C
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const ChartWidget = ({ sensorId = 1, limit = 60, refreshMs = 3000 } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const res = await fetchChartDataStatus({ sensorId, limit });
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
  }, [sensorId, limit, refreshMs]);

  if (loading) {
    return <Skeleton variant="rectangular" height="400px" sx={{ borderRadius: 0, bgcolor: '#141414' }} />;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 0,
        bgcolor: '#141414',
        borderColor: '#2A2A2A',
        p: 3,
        height: '400px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ color: '#FFFFFF', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem' }}>
          Thermal Metrics
        </Typography>
        <Typography sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', letterSpacing: '1px' }}>
          UNIT: °C
        </Typography>
      </Box>

      {error ? (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            borderRadius: 0,
            bgcolor: '#0D0D0D',
            borderColor: '#2A2A2A',
            color: '#FFFFFF',
            '& .MuiAlert-icon': { color: '#FF003C' },
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
                  const res = await fetchChartDataStatus({ sensorId, limit });
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
                color: '#D4FF00',
                borderRadius: 0,
                border: '1px solid #2A2A2A',
                minWidth: 0,
                px: 1.25,
                '&:hover': { borderColor: '#444' },
              }}
            >
              Retry
            </Button>
          }
        >
          <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.80rem' }}>
            Failed to load readings {error?.status ? `(HTTP ${error.status})` : ''}: {error?.message || 'Unknown error'}
          </Typography>
          <Typography sx={{ mt: 1, color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>
            Check that the API is running and `/readings` is available, then retry.
          </Typography>
        </Alert>
      ) : data.length === 0 ? (
        <Alert
          severity="info"
          variant="outlined"
          sx={{
            borderRadius: 0,
            bgcolor: '#0D0D0D',
            borderColor: '#2A2A2A',
            color: '#FFFFFF',
            '& .MuiAlert-icon': { color: '#D4FF00' },
          }}
        >
          <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.80rem' }}>
            No readings yet.
          </Typography>
          <Typography sx={{ mt: 1, color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>
            Start `Monitor.py` (or send readings to the API) to see live temperature.
          </Typography>
        </Alert>
      ) : null}

      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#888888', fontSize: 11, fontFamily: '"Roboto Mono", monospace' }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: '#888888', fontSize: 11, fontFamily: '"Roboto Mono", monospace' }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(val) => `${val}°`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#444444', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Legend
              wrapperStyle={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', color: '#888888', paddingTop: '10px' }}
              iconType="square"
            />
            <Line
              type="monotone"
              dataKey="cpu"
              name="CPU"
              stroke="#D4FF00"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#D4FF00', stroke: '#141414', strokeWidth: 2 }}
            />
           
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ChartWidget;