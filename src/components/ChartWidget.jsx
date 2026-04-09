import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartWidget = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false, text: 'Server CPU Usage' },
    },
  };

  const data = {
    labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25'],
    datasets: [
      {
        label: 'CPU %',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          System Performance Mockup
        </Typography>
        <Line options={options} data={data} />
      </CardContent>
    </Card>
  );
};

export default ChartWidget;