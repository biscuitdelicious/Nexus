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

const SeverityPieChart = () => {
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
    const id = setInterval(loadData, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (loading) {
    return <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', bgcolor: COLORS.surface }} />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SeverityPieChart;