import React from 'react';
import { useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Alarm', value: 11, color: '#ff3b30' },
  { name: 'Incident', value: 31, color: '#ff9500' },
  { name: 'Event', value: 64, color: '#0A84FF' }
];

const SeverityPieChart = () => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: '8px',
            border: 'none',
            boxShadow: theme.shadows[3]
          }}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SeverityPieChart;