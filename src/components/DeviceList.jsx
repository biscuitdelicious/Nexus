import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Paper, Chip, Box, Skeleton } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import RouterIcon from '@mui/icons-material/Router';
import SecurityIcon from '@mui/icons-material/Security';
import DnsIcon from '@mui/icons-material/Dns';
import { fetchDevices } from '../services/api';
import { COLORS } from '../theme/colors';
import {refreshTime} from '../pages/Dashboard';

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
    case 'Healthy':  return { color: COLORS.ok,        borderColor: COLORS.ok };
    case 'Event':    return { color: COLORS.textMuted, borderColor: COLORS.textMuted };
    case 'Incident': return { color: COLORS.warn,      borderColor: COLORS.warn };
    case 'Alarm':    return { color: COLORS.critical,  borderColor: COLORS.critical };
    default:         return { color: COLORS.text,      borderColor: COLORS.border };
  }
};

const DeviceList = ({ showOnlyIssues = false, refreshMs = refreshTime }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const result = await fetchDevices();
        if (!cancelled) setDevices(result);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshMs]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 0, bgcolor: COLORS.surface }} />
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
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                transition: 'none',
                '&:hover': {
                  background: 'rgba(88, 166, 255, 0.06)',
                  borderColor: COLORS.info,
                  '& .MuiAvatar-root': {
                    color: COLORS.info,
                    borderColor: COLORS.info
                  }
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  variant="square"
                  sx={{
                    bgcolor: COLORS.surface,
                    color: COLORS.textMuted,
                    border: `1px solid ${COLORS.border}`,
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
                  <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.85rem', color: COLORS.text, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {device.name}
                  </Typography>
                }
                secondary={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    <Typography component="span" sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', color: COLORS.textMuted }}>
                      {device.ip}
                    </Typography>
                    <Typography component="span" sx={{ color: COLORS.border, fontSize: '0.75rem' }}>
                      |
                    </Typography>
                    <Typography component="span" sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
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