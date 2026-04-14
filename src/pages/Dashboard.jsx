import React, { useState, useEffect } from 'react';
import { Grid, Skeleton, Box, Typography, Paper, Card, CardContent, Fade } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';

import ChartWidget from '../components/ChartWidget';
import DeviceList from '../components/DeviceList';
import SeverityPieChart from '../components/SeverityPieChart';
import ResolutionBarChart from '../components/ResolutionBarChart';

const topMetrics = [
  { id: 1, title: 'CPU', value: '87%', color: '#ff4d4d' },
  { id: 2, title: 'Memory', value: '6.2 GB', color: '#ffb84d' },
  { id: 3, title: 'Network Traffic', value: '340 Mb/s', color: '#4da6ff' },
  { id: 4, title: 'Response Time', value: '142 ms', color: '#2eb82e' },
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Fade in={true} timeout={800}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.2,
              borderRadius: '14px',
              background: 'rgba(10, 132, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(10, 132, 255, 0.3)',
              boxShadow: '0 4px 20px rgba(10, 132, 255, 0.2)',
            }}
          >
            <DashboardIcon sx={{ color: '#0A84FF', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #A0A0AB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Incident Control Panel
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            ml: 7.5,
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: 500,
          }}
        >
          Overview of system status, active incidents, and resolution metrics.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {topMetrics.map((metric) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={metric.id}>
              {loading ? (
                <Skeleton variant="rectangular" height={100} animation="wave" sx={{ borderRadius: 2 }} />
              ) : (
                <Card variant="outlined" sx={{ height: '100%', borderTop: `4px solid ${metric.color}` }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {metric.title}
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {metric.value}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} alignItems="stretch" sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
            {loading ? (
              <Skeleton variant="rectangular" height={400} animation="wave" sx={{ borderRadius: 2 }} />
            ) : (
              <Box sx={{ height: '100%', width: '100%', minWidth: 0 }}>
                <ChartWidget />
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            {loading ? (
              <Skeleton variant="rectangular" height={400} animation="wave" sx={{ borderRadius: 2 }} />
            ) : (
              <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Active Incidents
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    '& .MuiPaper-root': {
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 0,
                      boxShadow: 'none'
                    },
                    '& .MuiList-root': {
                      bgcolor: 'transparent'
                    }
                  }}
                >
                  <DeviceList showOnlyIssues={true} />
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>

        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 4 }}>
             {loading ? (
                <Skeleton variant="rectangular" height={320} animation="wave" sx={{ borderRadius: 2 }} />
             ) : (
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Total Alerts (Status)
                  </Typography>
                  <SeverityPieChart />
                </Paper>
             )}
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
             {loading ? (
                <Skeleton variant="rectangular" height={320} animation="wave" sx={{ borderRadius: 2 }} />
             ) : (
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Average Resolution Time
                  </Typography>
                  <ResolutionBarChart />
                </Paper>
             )}
          </Grid>
        </Grid>

      </Box>
    </Fade>
  );
};

export default Dashboard;