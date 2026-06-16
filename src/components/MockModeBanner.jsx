import React from 'react';
import { Box, Typography } from '@mui/material';
import { USE_MOCK_API } from '../services/apiConfig';
import { COLORS } from '../theme/colors';

export default function MockModeBanner() {
  if (!USE_MOCK_API) return null;
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        py: 0.5,
        textAlign: 'center',
        bgcolor: 'rgba(212, 255, 0, 0.12)',
        borderTop: `1px solid ${COLORS.accentNeon}`,
      }}
    >
      <Typography sx={{ color: COLORS.accentNeon, fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1 }}>
        MOCK MODE — frontend only (no backend / database)
      </Typography>
    </Box>
  );
}
