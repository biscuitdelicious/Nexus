import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Box, Typography, Skeleton } from '@mui/material';
import { fetchSeverityData } from '../services/api';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: '#0D0D0D', border: '1px solid #2A2A2A', p: 1.5, borderRadius: 0 }}>
        <Typography sx={{ color: payload[0].payload.fill, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700, mb: 0.5, letterSpacing: '1px' }}>
          {payload[0].name}
        </Typography>
        <Typography sx={{ color: '#FFFFFF', fontFamily: '"Roboto Mono", monospace', fontSize: '1.25rem', fontWeight: 700 }}>
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
    const loadData = async () => {
      try {
        const result = await fetchSeverityData();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', bgcolor: '#141414' }} />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
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