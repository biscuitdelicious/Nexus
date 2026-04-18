import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Paper, Chip, Box, Skeleton } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import RouterIcon from '@mui/icons-material/Router';
import SecurityIcon from '@mui/icons-material/Security';
import DnsIcon from '@mui/icons-material/Dns';
import { fetchDevices } from '../services/api';

const getIcon = (type) => {
  switch (type) {
    case 'Server': return <StorageIcon fontSize="small" />;
    case 'Network': return <RouterIcon fontSize="small" />;
    case 'Security': return <SecurityIcon fontSize="small" />;
    default: return <DnsIcon fontSize="small" />;
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Healthy': return { color: '#D4FF00', borderColor: '#D4FF00' };
    case 'Event': return { color: '#888888', borderColor: '#888888' };
    case 'Incident': return { color: '#FFA500', borderColor: '#FFA500' };
    case 'Alarm': return { color: '#FF003C', borderColor: '#FF003C' };
    default: return { color: '#FFFFFF', borderColor: '#2A2A2A' };
  }
};

const DeviceList = ({ showOnlyIssues = false }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchDevices();
        setDevices(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 0, bgcolor: '#141414' }} />
        ))}
      </Box>
    );
  }

  const displayedDevices = showOnlyIssues
    ? devices.filter((device) => device.status !== 'Healthy')
    : devices;

  return (
    <Paper
      variant="outlined"
      sx={{
        height: '100%',
        overflow: 'auto',
        background: 'transparent',
        border: 'none',
      }}
    >
      <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
        {displayedDevices.map((device) => {
          const statusStyle = getStatusStyle(device.status);

          return (
            <ListItem
              key={device.id}
              sx={{
                mb: 1,
                borderRadius: 0,
                border: '1px solid #2A2A2A',
                background: '#141414',
                transition: 'none',
                '&:hover': {
                  background: 'rgba(212, 255, 0, 0.02)',
                  borderColor: '#D4FF00',
                  '& .MuiAvatar-root': {
                    color: '#D4FF00',
                    borderColor: '#D4FF00'
                  }
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  variant="square"
                  sx={{
                    bgcolor: '#0D0D0D',
                    color: '#888888',
                    border: '1px solid #2A2A2A',
                    width: 36,
                    height: 36
                  }}
                >
                  {getIcon(device.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={
                  <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {device.name}
                  </Typography>
                }
                secondary={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    <Typography component="span" sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', color: '#888888' }}>
                      {device.ip}
                    </Typography>
                    <Typography component="span" sx={{ color: '#2A2A2A', fontSize: '0.75rem' }}>
                      |
                    </Typography>
                    <Typography component="span" sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {device.type}
                    </Typography>
                  </Box>
                }
              />
              <Chip
                label={device.status}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 0,
                  fontFamily: '"Roboto Mono", monospace',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: statusStyle.color,
                  borderColor: statusStyle.borderColor,
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default DeviceList;