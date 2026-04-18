import React, { useState, useEffect } from 'react';
import { Box, Typography, Fade, Grid, Paper, Button, Skeleton } from '@mui/material';
import DnsIcon from '@mui/icons-material/Dns';
import DeviceList from '../components/DeviceList';
import { fetchDevices } from '../services/api';

const Devices = () => {
  const [stats, setStats] = useState({ total: 0, healthy: 0, issues: 0, healthPercentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDevices();
        const total = data.length;
        const healthy = data.filter(device => device.status === 'Healthy').length;
        const issues = total - healthy;
        const healthPercentage = total > 0 ? Math.round((healthy / total) * 100) : 0;

        setStats({ total, healthy, issues, healthPercentage });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
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
            <DnsIcon sx={{ color: '#D4FF00', fontSize: 28 }} />
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
              Device Management
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
          Provision, monitor, and manage your infrastructure assets.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 0, bgcolor: '#141414', borderColor: '#2A2A2A' }}>
              {loading ? (
                <Skeleton variant="rectangular" width="40%" height={45} sx={{ mx: 'auto', bgcolor: '#0D0D0D', mb: 0.5 }} />
              ) : (
                <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '2rem', color: '#D4FF00' }}>
                  {stats.total}
                </Typography>
              )}
              <Typography sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Total Assets
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 0, bgcolor: '#141414', borderColor: '#2A2A2A' }}>
              {loading ? (
                <Skeleton variant="rectangular" width="40%" height={45} sx={{ mx: 'auto', bgcolor: '#0D0D0D', mb: 0.5 }} />
              ) : (
                <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '2rem', color: '#FFFFFF' }}>
                  {stats.healthy}
                </Typography>
              )}
              <Typography sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Healthy Units
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 0, bgcolor: '#141414', borderColor: '#2A2A2A' }}>
              {loading ? (
                <Skeleton variant="rectangular" width="40%" height={45} sx={{ mx: 'auto', bgcolor: '#0D0D0D', mb: 0.5 }} />
              ) : (
                <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '2rem', color: '#FF003C' }}>
                  {stats.issues}
                </Typography>
              )}
              <Typography sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Active Issues
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ height: '60vh' }}>
              <DeviceList />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                borderRadius: 0,
                bgcolor: '#141414',
                borderColor: '#2A2A2A'
              }}
            >
              <Box>
                <Typography sx={{ color: '#FFFFFF', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', mb: 2 }}>
                  Environment Health
                </Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={8} sx={{ width: '100%', bgcolor: '#0D0D0D' }} />
                ) : (
                  <Box
                    sx={{
                      height: 8,
                      width: '100%',
                      bgcolor: '#0D0D0D',
                      borderRadius: 0,
                      border: '1px solid #2A2A2A',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${stats.healthPercentage}%`,
                        bgcolor: '#D4FF00',
                        transition: 'width 1s ease-in-out'
                      }}
                    />
                  </Box>
                )}
                <Typography sx={{ mt: 1.5, display: 'block', color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {loading ? 'CALCULATING STATUS...' : `${stats.healthPercentage}% of devices are operating within normal parameters.`}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: '#FFFFFF', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button variant="contained" fullWidth sx={{ borderRadius: 0, bgcolor: '#D4FF00', color: '#000000', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, letterSpacing: '1px', '&:hover': { bgcolor: '#BDE600' } }}>
                    Add New Device
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ borderRadius: 0, borderColor: '#2A2A2A', color: '#FFFFFF', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, letterSpacing: '1px', '&:hover': { borderColor: '#888888', bgcolor: 'transparent' } }}>
                    Scan Network
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ borderRadius: 0, borderColor: '#FF003C', color: '#FF003C', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, letterSpacing: '1px', '&:hover': { borderColor: '#FF003C', bgcolor: 'rgba(255, 0, 60, 0.05)' } }}>
                    Clear Alerts
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', p: 2, bgcolor: '#0D0D0D', border: '1px solid #2A2A2A', borderRadius: 0 }}>
                <Typography sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 0.5 }}>
                  Last Scan:
                </Typography>
                <Typography sx={{ color: '#D4FF00', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px' }}>
                  TODAY {new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Devices;