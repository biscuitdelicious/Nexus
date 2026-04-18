import React from 'react';
import { Box, Typography, Fade } from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

import MetricsCards from '../components/MetricsCards';
import LogsTable from '../components/LogsTable';
import { summaryMetrics, logEntries } from '../data/metricsLogsMock';

const Observability = () => (
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
          <QueryStatsIcon sx={{ color: '#D4FF00', fontSize: 28 }} />
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
            Metrics & Logs
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
        System telemetry, active KPIs, and the tail of recent events.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <MetricsCards metrics={summaryMetrics} />
      </Box>

      <Box sx={{ animation: 'fadeInUp 0.8s ease-out' }}>
        <LogsTable entries={logEntries} />
      </Box>
    </Box>
  </Fade>
);

export default Observability;