import React from 'react';
import { Box, Typography, Fade } from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

import MetricsCards from '../components/MetricsCards';
import LogsTable from '../components/LogsTable';
import { summaryMetrics, logEntries } from '../data/metricsLogsMock';

const Observability = () => (
  // Animație fină de Fade-in la încărcarea paginii
  <Fade in={true} timeout={800}>
    <Box>
      {/* Header-ul paginii stilizat */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
        {/* Cubul de sticlă pentru iconiță */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1.2,
            borderRadius: '14px',
            background: 'rgba(10, 132, 255, 0.15)', // Albastru transparent
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(10, 132, 255, 0.3)',
            boxShadow: '0 4px 20px rgba(10, 132, 255, 0.2)',
          }}
        >
          <QueryStatsIcon sx={{ color: '#0A84FF', fontSize: 28 }} />
        </Box>

        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #A0A0AB 100%)', // Gradient modern metalic
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Metrics & Logs
          </Typography>
        </Box>
      </Box>

      {/* Subtitlul */}
      <Typography
        variant="body1"
        sx={{
          mb: 4,
          ml: 7.5, // Aliniat cu textul titlului, trecând de iconiță
          color: 'rgba(255, 255, 255, 0.5)',
          fontWeight: 500
        }}
      >
        System telemetry, active KPIs, and the tail of recent events.
      </Typography>

      {/* Conținutul (care moștenește glassmorphism din theme.js) */}
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