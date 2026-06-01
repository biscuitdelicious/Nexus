import React, { useState, useEffect } from 'react';
import { Box, Typography, Fade, Grid, Paper, Button, Skeleton } from '@mui/material';
import DnsIcon from '@mui/icons-material/Dns';
import DeviceList from '../components/DeviceList';
import AddDeviceModal from '../components/AddDeviceModal';
import { fetchDevices, clearAllAlerts } from '../services/api';
import { COLORS } from '../theme/colors';

const Devices = () => {
  const [stats, setStats] = useState({ total: 0, healthy: 0, issues: 0, healthPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastScan, setLastScan] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDevices();
        const total = data.length;
        const healthy = data.filter(device => device.status === 'Healthy').length;
        const issues = total - healthy;
        const healthPercentage = total > 0 ? Math.round((healthy / total) * 100) : 0;

        setStats({ total, healthy, issues, healthPercentage });
        setLastScan(new Date());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setScanning(false);
      }
    };

    loadStats();
  }, [refreshKey]);

  const handleCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  // Re-scan = re-fetch sensors + derived status from backend.
  const handleScan = () => {
    setScanning(true);
    setRefreshKey((k) => k + 1);
  };

  // Resolve every open event via backend, then refresh.
  const handleClearAlerts = async () => {
    setClearing(true);
    const res = await clearAllAlerts();
    setClearing(false);
    if (res.ok) {
      setRefreshKey((k) => k + 1);
    } else {
      console.error('Clear alerts failed:', res.message);
    }
  };

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
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <DnsIcon sx={{ color: COLORS.info, fontSize: 28 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: COLORS.text,
                fontFamily: '"Georgia", serif',
                fontStyle: 'italic',
                fontWeight: 'normal',
              }}
            >
              Devices
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            ml: 8.5,
            color: COLORS.textMuted,
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Sensors, locations, and physical units in the network.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 0, bgcolor: COLORS.surface, borderColor: COLORS.border }}>
              {loading ? (
                <Skeleton variant="rectangular" width="40%" height={45} sx={{ mx: 'auto', bgcolor: COLORS.surface, mb: 0.5 }} />
              ) : (
                <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '2rem', color: COLORS.info }}>
                  {stats.total}
                </Typography>
              )}
              <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Total Assets
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 0, bgcolor: COLORS.surface, borderColor: COLORS.border }}>
              {loading ? (
                <Skeleton variant="rectangular" width="40%" height={45} sx={{ mx: 'auto', bgcolor: COLORS.surface, mb: 0.5 }} />
              ) : (
                <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '2rem', color: COLORS.text }}>
                  {stats.healthy}
                </Typography>
              )}
              <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Healthy Units
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 0, bgcolor: COLORS.surface, borderColor: COLORS.border }}>
              {loading ? (
                <Skeleton variant="rectangular" width="40%" height={45} sx={{ mx: 'auto', bgcolor: COLORS.surface, mb: 0.5 }} />
              ) : (
                <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '2rem', color: COLORS.critical }}>
                  {stats.issues}
                </Typography>
              )}
              <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Active Issues
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ height: '60vh' }}>
              <DeviceList key={refreshKey} />
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
                bgcolor: COLORS.surface,
                borderColor: COLORS.border
              }}
            >
              <Box>
                <Typography sx={{ color: COLORS.text, fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', mb: 2 }}>
                  Environment Health
                </Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={8} sx={{ width: '100%', bgcolor: COLORS.surface }} />
                ) : (
                  <Box
                    sx={{
                      height: 8,
                      width: '100%',
                      bgcolor: COLORS.surface,
                      borderRadius: 0,
                      border: `1px solid ${COLORS.border}`,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${stats.healthPercentage}%`,
                        bgcolor: COLORS.info,
                        transition: 'width 1s ease-in-out'
                      }}
                    />
                  </Box>
                )}
                <Typography sx={{ mt: 1.5, display: 'block', color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {loading ? 'CALCULATING STATUS...' : `${stats.healthPercentage}% of devices are operating within normal parameters.`}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: COLORS.text, fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button onClick={() => setAddOpen(true)} variant="contained" fullWidth sx={{ borderRadius: 0, bgcolor: COLORS.info, color: COLORS.bg, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, letterSpacing: '1px', '&:hover': { bgcolor: COLORS.info } }}>
                    Add New Device
                  </Button>
                  <Button onClick={handleScan} disabled={scanning} variant="outlined" fullWidth sx={{ borderRadius: 0, borderColor: COLORS.border, color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, letterSpacing: '1px', '&:hover': { borderColor: COLORS.textMuted, bgcolor: 'transparent' } }}>
                    {scanning ? 'Scanning...' : 'Scan Network'}
                  </Button>
                  <Button onClick={handleClearAlerts} disabled={clearing || stats.issues === 0} variant="outlined" fullWidth sx={{ borderRadius: 0, borderColor: COLORS.critical, color: COLORS.critical, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, letterSpacing: '1px', '&:hover': { borderColor: COLORS.critical, bgcolor: 'rgba(255, 0, 60, 0.05)' } }}>
                    {clearing ? 'Clearing...' : 'Clear Alerts'}
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', p: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 0 }}>
                <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 0.5 }}>
                  Last Scan:
                </Typography>
                <Typography sx={{ color: COLORS.info, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px' }}>
                  {lastScan ? `TODAY ${lastScan.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}` : '—'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <AddDeviceModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreated={handleCreated}
        />
      </Box>
    </Fade>
  );
};

export default Devices;