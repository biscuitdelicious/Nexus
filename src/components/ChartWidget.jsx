import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const temperatureData = [
  { time: '10:00', cpu: 45, ram: 40, board: 35 },
  { time: '10:05', cpu: 48, ram: 42, board: 36 },
  { time: '10:10', cpu: 52, ram: 47, board: 37 },
  { time: '10:15', cpu: 82, ram: 75, board: 42 },
  { time: '10:20', cpu: 78, ram: 72, board: 41 },
  { time: '10:25', cpu: 65, ram: 60, board: 39 },
  { time: '10:30', cpu: 55, ram: 52, board: 37 },
];

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

const ChartWidget = () => {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 0,
        bgcolor: '#141414',
        borderColor: '#2A2A2A',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ color: '#FFFFFF', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem' }}>
          Thermal Metrics (Core/RAM/Board)
        </Typography>
        <Typography sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', letterSpacing: '1px' }}>
          UNIT: °C
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={temperatureData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
              name="CPU_TEMP"
              stroke="#D4FF00"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#D4FF00', stroke: '#141414', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="ram"
              name="RAM_TEMP"
              stroke="#FFA500"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#FFA500', stroke: '#141414', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="board"
              name="SYS_BOARD"
              stroke="#696969"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#696969', stroke: '#141414', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ChartWidget;