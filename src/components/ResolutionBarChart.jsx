import React from 'react';
import { useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Monday', time: 120 },
  { day: 'Tuesday', time: 85 },
  { day: 'Wednesday', time: 100 },
  { day: 'Thursday', time: 60 },
  { day: 'Friday', time: 40 }
];

const ResolutionBarChart = () => {
  const theme = useTheme();
  const axisColor = theme.palette.text.secondary;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: '8px',
            border: 'none',
            boxShadow: theme.shadows[3]
          }}
          formatter={(value) => [`${value} min`, 'Resolution Time']}
        />
        <Bar dataKey="time" fill="#0A84FF" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResolutionBarChart;