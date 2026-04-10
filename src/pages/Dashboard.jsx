import React, { useState, useEffect } from 'react';
import { Grid, Skeleton, Box, Typography, Paper } from '@mui/material';

import ChartWidget from '../components/ChartWidget';
import DeviceList from '../components/DeviceList';

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
      <Typography variant="h4" sx={{ mb: 3 }}>
        Infrastructure Overview
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={8}>
          {loading ? (
            <Skeleton variant="rectangular" height={350} animation="wave" />
          ) : (
            <Box sx={{ height: '100%' }}>
              <ChartWidget />
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {loading ? (
            <Skeleton variant="rectangular" height={350} animation="wave" />
          ) : (
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Active Alerts & Tickets
              </Typography>
              <Box sx={{ flexGrow: 1, overflow: 'auto', '& .MuiPaper-root': { border: 'none', borderRadius: 0 } }}>
                <DeviceList showOnlyIssues={true} />
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;