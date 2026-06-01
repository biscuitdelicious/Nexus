import React, { useState, useEffect } from 'react';
import { Grid, Skeleton, Box, Typography, Paper, Card, CardContent, Fade } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChartWidget from '../components/ChartWidget';
import DeviceList from '../components/DeviceList';
import SeverityPieChart from '../components/SeverityPieChart';
import ResolutionBarChart from '../components/ResolutionBarChart';
import AlarmFrequencyChart from '../components/AlarmFrequencyChart';
import { fetchDashboardMetrics } from '../services/api';
import { useUrlState } from '../hooks/useUrlState';
import { COLORS } from '../theme/colors';

const VALID_RANGES = new Set(['15m', '1h', '6h', '24h']);

const Dashboard = ({ setActivePage }) => {
  const [params, patchParams] = useUrlState();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRange = VALID_RANGES.has(params.chart_range) ? params.chart_range : '1h';
  const setChartRange = (range) => patchParams({ chart_range: range });

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const data = await fetchDashboardMetrics();
        if (!cancelled) setMetrics(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    const id = setInterval(loadData, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const paperStyle = {
    borderRadius: 0,
    bgcolor: COLORS.surface,
    borderColor: COLORS.border,
    p: .6,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.75,
              borderRadius: 0,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <DashboardIcon sx={{ color: COLORS.info, fontSize: 20 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: COLORS.text,
              fontFamily: '"Georgia", serif',
              fontStyle: 'italic',
              fontWeight: 'normal',
            }}
          >
            Overview
          </Typography>
        </Box>

        <Grid container spacing={1} sx={{ flexShrink: 0 }}>
          {loading
            ? [1, 2, 3, 4].map((skeletonId) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={skeletonId}>
                  <Skeleton variant="rectangular" height={60} animation="wave" sx={{ borderRadius: 0, bgcolor: COLORS.surface }} />
                </Grid>
              ))
            : metrics.map((metric) => {
                const CARD_TARGET = {
                  'CPU TEMP':     'Observability',
                  'OPEN TICKETS': 'Tickets',
                  'TOTAL EVENTS': 'Tickets',
                  'SENSOR ID':    'Devices',
                };
                const target = CARD_TARGET[metric.title];
                const clickable = !!target && typeof setActivePage === 'function';
                return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={metric.id}>
                  <Card
                    variant="outlined"
                    onClick={clickable ? () => setActivePage(target) : undefined}
                    sx={{
                      borderRadius: 0,
                      bgcolor: COLORS.surface,
                      borderColor: COLORS.border,
                      borderLeft: `4px solid ${COLORS.border}`,
                      height: '100%',
                      transition: 'none',
                      cursor: clickable ? 'pointer' : 'default',
                      '&:hover': {
                        borderColor: COLORS.textMuted,
                        borderLeft: `4px solid ${COLORS.info}`,
                        bgcolor: 'rgba(88, 166, 255, 0.05)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                      <Typography
                        sx={{
                          color: COLORS.textMuted,
                          fontFamily: '"Roboto Mono", monospace',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          mb: 0.25
                        }}
                      >
                        {metric.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: COLORS.info,
                          fontFamily: '"Roboto Mono", monospace',
                          fontWeight: 700,
                          fontSize: '1.4rem',
                          lineHeight: 1.1,
                        }}
                      >
                        {metric.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                );
              })}
        </Grid>

        <Grid container spacing={1} alignItems="stretch" sx={{ flex: '1 1 0', minHeight: 0 }}>
          <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0, height: '100%' }}>
            <Box sx={{ height: '100%', width: '100%', minWidth: 0 }}>
              <ChartWidget range={chartRange} onRangeChange={setChartRange} />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
            <Paper variant="outlined" sx={paperStyle}>
              <Typography sx={{ color: COLORS.text, fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '0.95rem', mb: 0.5, flexShrink: 0 }}>
                Active Incidents
              </Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  minHeight: 0,
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
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="stretch" sx={{ flex: '1 1 0', minHeight: 0 }}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
            <Paper variant="outlined" sx={paperStyle}>
              <Typography sx={{ color: COLORS.text, fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '0.95rem', mb: 0.5, flexShrink: 1 }}>
                Total Tickets
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <SeverityPieChart />
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
            <Paper variant="outlined" sx={paperStyle}>
              <Typography sx={{ color: COLORS.text, fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '0.95rem', mb: 0.5, flexShrink: 1 }}>
                Alarms Frequency
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <AlarmFrequencyChart />
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
            <Paper variant="outlined" sx={paperStyle}>
              <Typography sx={{ color: COLORS.text, fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '0.95rem', mb: 0.5, flexShrink: 1 }}>
                Avg Resolution
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResolutionBarChart />
              </Box>
            </Paper>
          </Grid>
        </Grid>

      </Box>
    </Fade>
  );
};

export default Dashboard;