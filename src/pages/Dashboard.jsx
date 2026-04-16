import React, { useState, useEffect } from 'react';
import { Grid, Skeleton, Box, Typography, Paper, Card, CardContent, Fade } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';

import ChartWidget from '../components/ChartWidget';
import DeviceList from '../components/DeviceList';
import SeverityPieChart from '../components/SeverityPieChart';
import ResolutionBarChart from '../components/ResolutionBarChart';

const topMetrics = [
  { id: 1, title: 'SYS.CPU_LOAD', value: '87%' },
  { id: 2, title: 'MEM.ALLOCATED', value: '6.2 GB' },
  { id: 3, title: 'NET.TRAFFIC_IO', value: '340 Mb/s' },
  { id: 4, title: 'API.LATENCY', value: '142 ms' },
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
              p: 1.5,
              borderRadius: 0,
              background: '#141414',
              border: '1px solid #2A2A2A',
            }}
          >
            <DashboardIcon sx={{ color: '#D4FF00', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontFamily: '"Georgia", serif',
                fontStyle: 'italic',
                fontWeight: 'normal',
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
            ml: 8.5,
            color: '#888888',
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Overview of system status, active incidents, and resolution metrics.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {topMetrics.map((metric) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={metric.id}>
              {loading ? (
                <Skeleton variant="rectangular" height={100} animation="wave" sx={{ borderRadius: 0, bgcolor: '#141414' }} />
              ) : (
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 0,
                    bgcolor: '#141414',
                    borderColor: '#2A2A2A',
                    borderLeft: '4px solid #2A2A2A',
                    height: '100%',
                    transition: 'none',
                    '&:hover': {
                      borderColor: '#444444',
                      borderLeft: '4px solid #D4FF00',
                      bgcolor: 'rgba(212, 255, 0, 0.02)'
                    }
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        color: '#888888',
                        fontFamily: '"Roboto Mono", monospace',
                        fontSize: '0.70rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        mb: 1
                      }}
                    >
                      {metric.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#D4FF00',
                        fontFamily: '"Roboto Mono", monospace',
                        fontWeight: 700
                      }}
                    >
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
              <Skeleton variant="rectangular" height={400} animation="wave" sx={{ borderRadius: 0, bgcolor: '#141414' }} />
            ) : (
              <Box sx={{ height: '100%', width: '100%', minWidth: 0 }}>
                <ChartWidget />
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            {loading ? (
              <Skeleton variant="rectangular" height={400} animation="wave" sx={{ borderRadius: 0, bgcolor: '#141414' }} />
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: 0, bgcolor: '#141414', borderColor: '#2A2A2A', p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ color: '#FFFFFF', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', mb: 2 }}>
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
                <Skeleton variant="rectangular" height={320} animation="wave" sx={{ borderRadius: 0, bgcolor: '#141414' }} />
             ) : (
                <Paper variant="outlined" sx={{ borderRadius: 0, bgcolor: '#141414', borderColor: '#2A2A2A', p: 2, height: '100%' }}>
                  <Typography sx={{ color: '#FFFFFF', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', mb: 2 }}>
                    Total Alerts
                  </Typography>
                  <SeverityPieChart />
                </Paper>
             )}
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
             {loading ? (
                <Skeleton variant="rectangular" height={320} animation="wave" sx={{ borderRadius: 0, bgcolor: '#141414' }} />
             ) : (
                <Paper variant="outlined" sx={{ borderRadius: 0, bgcolor: '#141414', borderColor: '#2A2A2A', p: 2, height: '100%' }}>
                  <Typography sx={{ color: '#FFFFFF', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', mb: 2 }}>
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