import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';

const MetricsCards = ({ metrics }) => (
  <Grid container spacing={2}>
    {metrics.map((m) => (
      <Grid key={m.id} size={{ xs: 12, sm: 6, lg: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {m.label}
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 600 }}>
            {m.value}
          </Typography>
          {m.sublabel ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {m.sublabel}
              </Typography>
            </Box>
          ) : null}
        </Paper>
      </Grid>
    ))}
  </Grid>
);

export default MetricsCards;
