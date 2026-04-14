import React from 'react';
import { Box, Typography, Fade, Grid, Paper, Button } from '@mui/material';
import DnsIcon from '@mui/icons-material/Dns';
import DeviceList from '../components/DeviceList';

const Devices = () => {
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
              background: 'rgba(94, 92, 230, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(94, 92, 230, 0.3)',
              boxShadow: '0 4px 20px rgba(94, 92, 230, 0.2)',
            }}
          >
            <DnsIcon sx={{ color: '#5E5CE6', fontSize: 28 }} />
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
              Device Management
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
          Provision, monitor, and manage your infrastructure assets.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                12
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Total Assets
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#34c759' }}>
                8
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Healthy Units
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#ff3b30' }}>
                4
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
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
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Environment Health
                </Typography>
                <Box
                  sx={{
                    height: 8,
                    width: '100%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: '66%',
                      bgcolor: 'primary.main',
                      boxShadow: '0 0 10px rgba(10, 132, 255, 0.5)',
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  66% of devices are operating within normal parameters.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button variant="contained" fullWidth>
                    Add New Device
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    Scan Network
                  </Button>
                  <Button variant="outlined" fullWidth color="error" sx={{ borderColor: 'rgba(255,59,48,0.2)' }}>
                    Clear Alerts
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Last Scan:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Today at 14:45 PM
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