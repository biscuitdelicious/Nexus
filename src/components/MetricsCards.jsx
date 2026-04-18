import React from 'react';
import { Grid, Paper, Typography, Box, Skeleton } from '@mui/material';

const MetricsCards = ({ metrics, loading }) => (
  <Grid container spacing={2}>
    {loading ? (
      [1, 2, 3, 4].map((i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Skeleton variant="rectangular" height={100} sx={{ bgcolor: '#141414', borderRadius: 0 }} />
        </Grid>
      ))
    ) : (
      metrics.map((m) => (
        <Grid key={m.id} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              bgcolor: '#141414',
              borderColor: '#2A2A2A',
              borderRadius: 0,
              borderLeft: '4px solid #2A2A2A',
              transition: 'none',
              '&:hover': {
                borderColor: '#444444',
                borderLeft: '4px solid #D4FF00',
                bgcolor: 'rgba(212, 255, 0, 0.02)'
              }
            }}
          >
            <Typography sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
              {m.label}
            </Typography>
            <Typography variant="h4" sx={{ color: '#D4FF00', fontFamily: '"Roboto Mono", monospace', fontWeight: 700 }}>
              {m.value}
            </Typography>
            {m.sublabel ? (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ color: '#444', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                  {m.sublabel}
                </Typography>
              </Box>
            ) : null}
          </Paper>
        </Grid>
      ))
    )}
  </Grid>
);

export default MetricsCards;