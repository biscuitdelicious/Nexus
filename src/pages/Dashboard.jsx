import React, { useState, useEffect } from 'react';
import { Grid, Typography, Skeleton, Box } from '@mui/material';
import ChartWidget from '../components/ChartWidget';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Infrastructure Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {loading ? (
            <Skeleton variant="rectangular" height={300} animation="wave" />
          ) : (
            <ChartWidget />
          )}
        </Grid>

        <Grid item xs={12} md={4}>
           {loading ? (
             <Skeleton variant="rectangular" height={300} animation="wave" />
           ) : (
             <Box sx={{ p: 2, border: '1px solid #ccc', height: '100%', borderRadius: 1 }}>
                 <Typography variant="h6">Alerts / Device List</Typography>
                 <Typography variant="body2" color="text.secondary">
                     Component placeholders for Issue #12.
                 </Typography>
             </Box>
           )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;