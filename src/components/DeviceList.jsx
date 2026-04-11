import React from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Paper, Chip } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import RouterIcon from '@mui/icons-material/Router';
import SecurityIcon from '@mui/icons-material/Security';
import DnsIcon from '@mui/icons-material/Dns';

const devices = [
  { id: 1, name: 'Web Server 01', type: 'Server', status: 'Healthy', ip: '192.168.1.10' },
  { id: 2, name: 'Database 01', type: 'Server', status: 'Alert', ip: '192.168.1.11' },
  { id: 3, name: 'Core Router', type: 'Network', status: 'Healthy', ip: '192.168.1.1' },
  { id: 4, name: 'Firewall Main', type: 'Security', status: 'Healthy', ip: '192.168.1.2' },
  { id: 5, name: 'Switch Rack A', type: 'Network', status: 'Healthy', ip: '192.168.1.3' },
  { id: 6, name: 'Cache Server', type: 'Server', status: 'Offline', ip: '192.168.1.12' },
  { id: 7, name: 'Load Balancer', type: 'Network', status: 'Healthy', ip: '192.168.1.5' },
  { id: 8, name: 'Backup Storage', type: 'Server', status: 'Alert', ip: '192.168.1.15' },
  { id: 9, name: 'VPN Gateway', type: 'Security', status: 'Healthy', ip: '192.168.1.4' },
  { id: 10, name: 'App Server 01', type: 'Server', status: 'Healthy', ip: '192.168.1.20' },
  { id: 11, name: 'App Server 02', type: 'Server', status: 'Critical', ip: '192.168.1.21' },
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
    case 'Alert': return 'warning';
    case 'Offline': return 'default';
    case 'Critical': return 'error';
    default: return 'primary';
  }
};

const DeviceList = ({ showOnlyIssues = false }) => {
  const displayedDevices = showOnlyIssues
    ? devices.filter((device) => device.status !== 'Healthy')
    : devices;

  return (
    <Paper variant="outlined" sx={{ height: '100%', overflow: 'auto' }}>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {displayedDevices.map((device) => (
          <ListItem key={device.id} divider>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: device.type === 'Server' ? 'primary.main' : device.type === 'Network' ? 'secondary.main' : 'info.main' }}>
                {getIcon(device.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={device.name}
              secondary={
                <React.Fragment>
                  <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                    {device.ip}
                  </Typography>
                  {" — " + device.type}
                </React.Fragment>
              }
            />
            <Chip
              label={device.status}
              color={getColor(device.status)}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DeviceList;