import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { performanceTimeSeries } from '../data/dashboardChartMock';

const ChartWidget = () => {
  const theme = useTheme();
  const axisColor = theme.palette.text.secondary;
  const gridColor =
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <Card variant="outlined" sx={{ height: '100%', width: '100%', minWidth: 0 }}>
      <CardContent sx={{ height: '100%', width: '100%', minWidth: 0, '&:last-child': { pb: 2 } }}>
        <Typography color="text.secondary" gutterBottom>
          System performance
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceTimeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="time" tick={{ fill: axisColor, fontSize: 12 }} tickLine={{ stroke: axisColor }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: axisColor, fontSize: 12 }}
              tickLine={{ stroke: axisColor }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
              }}
              formatter={(value) => [`${value}%`, '']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cpu"
              name="CPU"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="memory"
              name="Memory"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChartWidget;
