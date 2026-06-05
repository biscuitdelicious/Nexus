import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Box, Typography, Skeleton } from '@mui/material';
import { fetchSeverityData } from '../services/api';
import { COLORS } from '../theme/colors';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, p: 1.5, borderRadius: 0 }}>
        <Typography sx={{ color: payload[0].payload.fill, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700, mb: 0.5, letterSpacing: '1px' }}>
          {payload[0].name}
        </Typography>
        <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '1.25rem', fontWeight: 700 }}>
          {payload[0].value}
        </Typography>
      </Box>
    );
  }
  return null;
};

const SeverityPieChart = ({ onSelect }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const result = await fetchSeverityData();
        if (!cancelled) setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    const id = setInterval(loadData, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (loading) {
    return <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', bgcolor: COLORS.surface }} />;
  }

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const empty = total === 0;
  const clickable = typeof onSelect === 'function';

  // When empty, draw one full muted ring so it's a real donut, not dead pixels.
  const chartData = empty ? [{ name: 'NONE', value: 1, color: COLORS.border }] : data;

  return (
    <Box
      onClick={clickable ? onSelect : undefined}
      title={clickable ? 'View tickets' : undefined}
      sx={{ position: 'relative', width: '100%', height: '100%', cursor: clickable ? 'pointer' : 'default' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={empty ? 0 : 3}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} cursor={clickable ? 'pointer' : 'default'} />
            ))}
          </Pie>
          {!empty && <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />}
        </PieChart>
      </ResponsiveContainer>

      {/* Center label: "NO TICKETS" only on the empty placeholder ring. */}
      {empty && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem', letterSpacing: '1px' }}>
            NO TICKETS
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SeverityPieChart;
