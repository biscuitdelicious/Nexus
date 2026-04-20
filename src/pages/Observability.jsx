import React, { useState, useEffect } from 'react';
import { Box, Typography, Fade, Skeleton } from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

import MetricsCards from '../components/MetricsCards';
import LogsTable from '../components/LogsTable';
import { fetchObservabilityMetrics, fetchLiveFeed } from '../services/api';

const Observability = () => {
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsData, logsData] = await Promise.all([
          fetchObservabilityMetrics(),
          fetchLiveFeed()
        ]);
        setMetrics(metricsData);
        setLogs(logsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 1 }, gap: 2 }}>
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
            <QueryStatsIcon sx={{ color: '#D4FF00', fontSize: { xs: 24, sm: 28 } }} />
          </Box>

          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontFamily: '"Georgia", serif',
                fontStyle: 'italic',
                fontWeight: 'normal',
                fontSize: { xs: '1.5rem', sm: '2.125rem' }
              }}
            >
              Metrics & Logs
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            ml: { xs: 0, sm: 8.5 },
            mt: { xs: 1, sm: 0 },
            color: '#888888',
            fontFamily: '"Roboto Mono", monospace',
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            textTransform: 'uppercase',
            letterSpacing: '1px',
            wordWrap: 'break-word'
          }}
        >
          System telemetry, active KPIs, and the tail of recent events.
        </Typography>

        <Box sx={{ mb: 4, width: '100%' }}>
          <MetricsCards metrics={metrics} loading={loading} />
        </Box>

        <Box sx={{ animation: 'fadeInUp 0.8s ease-out', width: '100%' }}>
          {loading ? (
            <Skeleton variant="rectangular" height={300} sx={{ bgcolor: '#141414', borderRadius: 0, width: '100%' }} />
          ) : (
            <LogsTable entries={logs} />
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default Observability;