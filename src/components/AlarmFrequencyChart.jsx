import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Box, Typography, Skeleton } from '@mui/material';
import { fetchAlarmFrequency } from '../services/api';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: '#0D0D0D', border: '1px solid #2A2A2A', p: 1.5, borderRadius: 0 }}>
        <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', mb: 0.5 }}>
          SOURCE: {payload[0].payload.name}
        </Typography>
        <Typography sx={{ color: '#FF003C', fontFamily: '"Roboto Mono", monospace', fontSize: '1.1rem', fontWeight: 700 }}>
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

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const result = await fetchAlarmFrequency();
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
  }, []);

  if (loading) {
    return <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 0, bgcolor: '#141414' }} />;
  }

  return (
    <Box sx={{ width: '100%', height: 250, mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#2A2A2A" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#888888', fontSize: 10, fontFamily: '"Roboto Mono", monospace' }}
            width={100}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 0, 60, 0.05)' }} />
          <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={18}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#FF003C' : '#FFA500'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AlarmFrequencyChart;