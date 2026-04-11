import React from 'react';
import { Box, Typography } from '@mui/material';

import MetricsCards from '../components/MetricsCards';
import LogsTable from '../components/LogsTable';
import { summaryMetrics, logEntries } from '../data/metricsLogsMock';

const Observability = () => (
  <Box>
    <Typography variant="h4" sx={{ mb: 1 }}>
      Metrics &amp; logs
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Summary KPIs and tail of recent events.
    </Typography>

    <Box sx={{ mb: 4 }}>
      <MetricsCards metrics={summaryMetrics} />
    </Box>

    <LogsTable entries={logEntries} />
  </Box>
);

export default Observability;
