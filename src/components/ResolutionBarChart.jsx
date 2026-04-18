import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@mui/material';
import { fetchResolutionData } from '../services/api';

const ResolutionBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchResolutionData();
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
    return <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 0, bgcolor: '#141414' }} />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
        <XAxis
          dataKey="day"
          tick={{ fill: '#888888', fontSize: 12, fontFamily: '"Roboto Mono", monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#888888', fontSize: 12, fontFamily: '"Roboto Mono", monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(212, 255, 0, 0.05)' }}
          contentStyle={{
            backgroundColor: '#0D0D0D',
            borderRadius: 0,
            border: '1px solid #2A2A2A',
            fontFamily: '"Roboto Mono", monospace',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          itemStyle={{ color: '#D4FF00', fontWeight: 700 }}
          labelStyle={{ color: '#888888', marginBottom: '8px' }}
          formatter={(value) => [`${value} MIN`, 'TIME']}
        />
        <Bar dataKey="time" fill="#D4FF00" radius={0} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResolutionBarChart;