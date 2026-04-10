import React from 'react';
import { Box, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />

      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div">
            Nexus Monitor
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Box
            sx={{
                width: 240,
                bgcolor: 'grey.200',
                borderRight: '1px solid',
                borderColor: 'grey.300',
                display: { xs: 'none', md: 'block' }
            }}
        />

        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;