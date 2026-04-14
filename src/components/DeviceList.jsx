import React from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Paper, Chip, Box } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import RouterIcon from '@mui/icons-material/Router';
import SecurityIcon from '@mui/icons-material/Security';
import DnsIcon from '@mui/icons-material/Dns';

const devices = [
  { id: 1, name: 'Web Server 01', type: 'Server', status: 'Healthy', ip: '192.168.1.10' },
  { id: 2, name: 'Database 01', type: 'Server', status: 'Event', ip: '192.168.1.11' },
  { id: 3, name: 'Core Router', type: 'Network', status: 'Healthy', ip: '192.168.1.1' },
  { id: 4, name: 'Firewall Main', type: 'Security', status: 'Healthy', ip: '192.168.1.2' },
  { id: 5, name: 'Switch Rack A', type: 'Network', status: 'Healthy', ip: '192.168.1.3' },
  { id: 6, name: 'Cache Server', type: 'Server', status: 'Incident', ip: '192.168.1.12' },
  { id: 7, name: 'Load Balancer', type: 'Network', status: 'Healthy', ip: '192.168.1.5' },
  { id: 8, name: 'Backup Storage', type: 'Server', status: 'Event', ip: '192.168.1.15' },
  { id: 9, name: 'VPN Gateway', type: 'Security', status: 'Healthy', ip: '192.168.1.4' },
  { id: 10, name: 'App Server 01', type: 'Server', status: 'Healthy', ip: '192.168.1.20' },
  { id: 11, name: 'App Server 02', type: 'Server', status: 'Alarm', ip: '192.168.1.21' },
  { id: 12, name: 'Switch Rack B', type: 'Network', status: 'Healthy', ip: '192.168.1.6' }
];

const getIcon = (type) => {
  switch (type) {
    case 'Server': return <StorageIcon />;
    case 'Network': return <RouterIcon />;
    case 'Security': return <SecurityIcon />;
    default: return <DnsIcon />;
  }
};

const getColor = (status) => {
  switch (status) {
    case 'Healthy': return 'success';
    case 'Event': return 'warning';
    case 'Incident': return 'default';
    case 'Alarm': return 'error';
    default: return 'primary';
  }
};

const getAvatarConfig = (type) => {
  switch (type) {
    case 'Server': return { bg: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF', border: 'rgba(10, 132, 255, 0.3)' };
    case 'Network': return { bg: 'rgba(94, 92, 230, 0.15)', color: '#5E5CE6', border: 'rgba(94, 92, 230, 0.3)' };
    case 'Security': return { bg: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', border: 'rgba(255, 149, 0, 0.3)' };
    default: return { bg: 'rgba(255, 255, 255, 0.1)', color: '#FFF', border: 'rgba(255, 255, 255, 0.2)' };
  }
};

const DeviceList = ({ showOnlyIssues = false }) => {
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
          const avatarCfg = getAvatarConfig(device.type);

          return (
            <ListItem
              key={device.id}
              sx={{
                mb: 1.5,
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'rgba(25, 25, 32, 0.4)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.08)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: avatarCfg.bg,
                    color: avatarCfg.color,
                    border: `1px solid ${avatarCfg.border}`,
                    borderRadius: '12px',
                    boxShadow: `0 4px 15px ${avatarCfg.bg}`
                  }}
                >
                  {getIcon(device.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                    {device.name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                      {device.ip}
                    </Typography>
                    <Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                      •
                    </Typography>
                    <Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>
                      {device.type}
                    </Typography>
                  </Box>
                }
              />
              <Chip
                label={device.status}
                color={getColor(device.status)}
                size="small"
                sx={{
                  fontWeight: 800,
                  borderRadius: '8px',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                  letterSpacing: '0.5px',
                  padding: '0 4px'
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