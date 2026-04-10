import React from 'react';
import { Box, Typography } from '@mui/material';
import DeviceList from '../components/DeviceList';

const Devices = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Device Management
      </Typography>
      <Box sx={{ height: '75vh' }}>
        <DeviceList />
      </Box>
    </Box>
  );
};

export default Devices;