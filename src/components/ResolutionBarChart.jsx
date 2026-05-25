import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@mui/material';
import { fetchResolutionData } from '../services/api';
import { COLORS } from '../theme/colors';

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
    return <Skeleton variant="rectangular" sx={{ borderRadius: 0, bgcolor: COLORS.surface, width: '100%', height: '100%' }} />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
        <XAxis
          dataKey="day"
          tick={{ fill: COLORS.textMuted, fontSize: 12, fontFamily: '"Roboto Mono", monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: COLORS.textMuted, fontSize: 12, fontFamily: '"Roboto Mono", monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(88, 166, 255, 0.08)' }}
          contentStyle={{
            backgroundColor: COLORS.surface,
            borderRadius: 0,
            border: `1px solid ${COLORS.border}`,
            fontFamily: '"Roboto Mono", monospace',
            color: COLORS.text,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          itemStyle={{ color: COLORS.info, fontWeight: 700 }}
          labelStyle={{ color: COLORS.textMuted, marginBottom: '8px' }}
          formatter={(value) => [`${value} MIN`, 'TIME']}
        />
        <Bar dataKey="time" fill={COLORS.info} radius={0} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResolutionBarChart;