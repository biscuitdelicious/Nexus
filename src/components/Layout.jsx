import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Avatar,
  LinearProgress,
  Fade,
  Skeleton,
  Popover,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Dns as DnsIcon,
  QueryStats as QueryStatsIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  GridView as GridViewIcon,
  Assignment as AssignmentIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Terminal as TerminalIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { fetchDashboardMetrics, fetchLiveFeed } from '../services/api';

const headerHeight = 80;

const NOTIF_STORAGE_KEY = 'nexus.notifications.readIds.v1';

const loadReadIds = () => {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map(String));
  } catch {
    return new Set();
  }
};

const saveReadIds = (set) => {
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

const Layout = ({ children, activePage, setActivePage }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(240);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [telemetryLoading, setTelemetryLoading] = useState(true);

  // Notifications (top bar)
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState('ALL'); // ALL | ALARM | INCIDENT | EVENT
  const [readIds, setReadIds] = useState(() => loadReadIds());

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 240) newWidth = 240;
      if (newWidth > 700) newWidth = 700;
      setDrawerWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing]);

  useEffect(() => {
    let mounted = true;
    const loadTelemetry = async () => {
      try {
        const [metricsData, logsData] = await Promise.all([
          fetchDashboardMetrics(),
          fetchLiveFeed()
        ]);
        if (mounted) {
          setMetrics(metricsData);
          setLogs(logsData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setTelemetryLoading(false);
        }
      }
    };
    loadTelemetry();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    let timer;

    const loadNotifications = async () => {
      setNotifLoading(true);
      setNotifError('');
      try {
        // Use the live feed (all events) as notification source.
        const items = await fetchLiveFeed();
        if (!mounted) return;
        // Keep newest first; cap to avoid unbounded growth.
        const sorted = (items || []).slice().sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
        setNotifications(sorted.slice(0, 50));
      } catch (e) {
        if (!mounted) return;
        setNotifError(e?.message || 'Failed to load notifications');
      } finally {
        if (mounted) setNotifLoading(false);
      }
    };

    loadNotifications();
    timer = setInterval(loadNotifications, 5000);
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    saveReadIds(readIds);
  }, [readIds]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getLogColor = (type) => {
    if (!type) return '#FFFFFF';
    switch (type.toUpperCase()) {
      case 'ALARM': return '#FF003C';
      case 'INCIDENT': return '#FFA500';
      case 'EVENT': return '#888888';
      default: return '#FFFFFF';
    }
  };

  const openNotifications = (e) => setNotifAnchorEl(e.currentTarget);
  const closeNotifications = () => setNotifAnchorEl(null);
  const notifOpen = Boolean(notifAnchorEl);

  const markRead = (id) => {
    if (!id) return;
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(String(id));
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const n of notifications) next.add(String(n.id));
      return next;
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'ALL') return true;
    return String(n.type || '').toUpperCase() === notifFilter;
  });

  const unreadCount = notifications.reduce((acc, n) => acc + (readIds.has(String(n.id)) ? 0 : 1), 0);

  const currentWidth = isCollapsed ? 80 : drawerWidth;
  const transitionStyle = isResizing ? 'none' : 'width 0.3s ease, margin 0.3s ease';
  const showExtendedPanel = currentWidth > 380 && !isCollapsed;

  const cpuMetric = metrics.find(m => m.title === 'SYS.CPU_LOAD') || { value: '0%' };
  const memMetric = metrics.find(m => m.title === 'MEM.ALLOCATED') || { value: '0 GB' };

  const cpuVal = parseInt(cpuMetric.value) || 0;
  const memNum = parseFloat(memMetric.value) || 0;
  const memPct = Math.min((memNum / 16) * 100, 100);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'row', backgroundColor: '#0D0D0D', position: 'relative', overflow: 'hidden' }}>

      <Box sx={{ width: isCollapsed ? 80 : 240, flexShrink: 0, display: 'flex', flexDirection: 'column', transition: transitionStyle }}>
        <Box sx={{ height: headerHeight, display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', px: isCollapsed ? 0 : 3, borderBottom: '0px solid #2A2A2A' }}>
          {!isCollapsed && (
            <Typography
              variant="h5"
              noWrap
              sx={{
                color: '#D4FF00',
                fontFamily: '"Roboto Mono", monospace',
                fontWeight: 700,
                letterSpacing: '-1px'
              }}
            >
              nexus.
            </Typography>
          )}
          <IconButton onClick={toggleCollapse} sx={{ color: '#D4FF00', borderRadius: 0, '&:hover': { backgroundColor: 'rgba(212, 255, 0, 0.1)' } }}>
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        <List sx={{ px: 0, pt: 2, flexGrow: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              selected={activePage === 'Dashboard'}
              onClick={() => handleNavClick('Dashboard')}
              sx={{
                borderRadius: 0,
                py: 1.5,
                px: isCollapsed ? 0 : 3,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderLeft: '2px solid transparent',
                transition: 'none',
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  borderLeft: '2px solid #D4FF00',
                  '& .MuiListItemIcon-root': { color: '#D4FF00' },
                  '& .MuiListItemText-primary': { color: '#D4FF00' }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: '#888888', mr: isCollapsed ? 0 : 2 }}><DashboardIcon fontSize="small" /></ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={activePage === 'Dashboard' ? '>_ DASHBOARD' : 'DASHBOARD'}
                  primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px', noWrap: true }}
                />
              )}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={activePage === 'Devices'}
              onClick={() => handleNavClick('Devices')}
              sx={{
                borderRadius: 0,
                py: 1.5,
                px: isCollapsed ? 0 : 3,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderLeft: '2px solid transparent',
                transition: 'none',
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  borderLeft: '2px solid #D4FF00',
                  '& .MuiListItemIcon-root': { color: '#D4FF00' },
                  '& .MuiListItemText-primary': { color: '#D4FF00' }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: '#888888', mr: isCollapsed ? 0 : 2 }}><DnsIcon fontSize="small" /></ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={activePage === 'Devices' ? '>_ DEVICES' : 'DEVICES'}
                  primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px', noWrap: true }}
                />
              )}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={activePage === 'Observability'}
              onClick={() => handleNavClick('Observability')}
              sx={{
                borderRadius: 0,
                py: 1.5,
                px: isCollapsed ? 0 : 3,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderLeft: '2px solid transparent',
                transition: 'none',
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  borderLeft: '2px solid #D4FF00',
                  '& .MuiListItemIcon-root': { color: '#D4FF00' },
                  '& .MuiListItemText-primary': { color: '#D4FF00' }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: '#888888', mr: isCollapsed ? 0 : 2 }}><QueryStatsIcon fontSize="small" /></ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={activePage === 'Observability' ? '>_ METRICS & LOGS' : 'METRICS & LOGS'}
                  primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px', noWrap: true }}
                />
              )}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={activePage === 'Tickets'}
              onClick={() => handleNavClick('Tickets')}
              sx={{
                borderRadius: 0,
                py: 1.5,
                px: isCollapsed ? 0 : 3,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderLeft: '2px solid transparent',
                transition: 'none',
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  borderLeft: '2px solid #D4FF00',
                  '& .MuiListItemIcon-root': { color: '#D4FF00' },
                  '& .MuiListItemText-primary': { color: '#D4FF00' }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: '#888888', mr: isCollapsed ? 0 : 2 }}><AssignmentIcon fontSize="small" /></ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={activePage === 'Tickets' ? '>_ TICKETS' : 'TICKETS'}
                  primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px', noWrap: true }}
                />
              )}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={activePage === 'Chatbot'}
              onClick={() => handleNavClick('Chatbot')}
              sx={{
                borderRadius: 0,
                py: 1.5,
                px: isCollapsed ? 0 : 3,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderLeft: '2px solid transparent',
                transition: 'none',
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  borderLeft: '2px solid #D4FF00',
                  '& .MuiListItemIcon-root': { color: '#D4FF00' },
                  '& .MuiListItemText-primary': { color: '#D4FF00' }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: '#888888', mr: isCollapsed ? 0 : 2 }}><SmartToyIcon fontSize="small" /></ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={activePage === 'Chatbot' ? '>_ ASSISTANT' : 'ASSISTANT'}
                  primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px', noWrap: true }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>

        {!isCollapsed && (
          <Box sx={{ p: 2, whiteSpace: 'nowrap' }}>
            <Box sx={{ p: 1.5, borderRadius: 0, backgroundColor: '#141414', border: '1px solid #2A2A2A' }}>
              <Typography sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 0.5 }}>
                Buffer State
              </Typography>
              <Typography sx={{ color: '#D4FF00', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px' }}>
                OPTIMAL
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {showExtendedPanel && (
        <Fade in={true} timeout={400}>
          <Box sx={{ flexGrow: 1, borderLeft: '1px solid #2A2A2A', backgroundColor: '#0a0a0a', p: 3, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', minWidth: 150 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TerminalIcon sx={{ color: '#888', fontSize: 18 }} />
                <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>
                  GLOBAL_TELEMETRY
                </Typography>
              </Box>

              {telemetryLoading ? (
                <Box>
                  <Skeleton variant="text" width="100%" height={24} sx={{ bgcolor: '#141414', mb: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={4} sx={{ bgcolor: '#141414', mb: 3 }} />
                  <Skeleton variant="text" width="100%" height={24} sx={{ bgcolor: '#141414', mb: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={4} sx={{ bgcolor: '#141414' }} />
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SpeedIcon sx={{ color: '#D4FF00', fontSize: 14 }} />
                        <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>CPU_AVG</Typography>
                      </Box>
                      <Typography sx={{ color: '#D4FF00', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700 }}>{cpuMetric.value}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={cpuVal} sx={{ height: 4, backgroundColor: '#141414', '& .MuiLinearProgress-bar': { backgroundColor: '#D4FF00' } }} />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MemoryIcon sx={{ color: '#FFA500', fontSize: 14 }} />
                        <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>MEM_ALLOC</Typography>
                      </Box>
                      <Typography sx={{ color: '#FFA500', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700 }}>{memMetric.value}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={memPct} sx={{ height: 4, backgroundColor: '#141414', '& .MuiLinearProgress-bar': { backgroundColor: '#FFA500' } }} />
                  </Box>
                </>
              )}
            </Box>

            <Box>
              <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 2, borderBottom: '1px solid #2A2A2A', pb: 1 }}>
                Recent Logs
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {telemetryLoading ? (
                  <>
                    <Skeleton variant="rectangular" width="100%" height={32} sx={{ bgcolor: '#141414', mb: 1 }} />
                    <Skeleton variant="rectangular" width="100%" height={32} sx={{ bgcolor: '#141414' }} />
                  </>
                ) : (
                  logs.slice(0, 4).map((log) => (
                    <Box key={log.id}>
                      <Typography sx={{ color: getLogColor(log.type), fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem', fontWeight: 700 }}>
                        [{log.type}]
                      </Typography>
                      <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', whiteSpace: 'normal', lineHeight: 1.3 }}>
                        {log.message}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </Fade>
      )}

      {!isCollapsed && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '4px',
            height: '100%',
            cursor: 'col-resize',
            backgroundColor: isResizing ? '#D4FF00' : 'transparent',
            transition: 'background-color 0.2s ease',
            zIndex: 10,
            '&:hover': {
              backgroundColor: '#D4FF00'
            }
          }}
        />
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D0D0D', overflowX: 'hidden' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${currentWidth}px)` },
          ml: { sm: `${currentWidth}px` },
          backgroundColor: '#0D0D0D',
          height: headerHeight,
          justifyContent: 'center',
          borderBottom: '1px solid #2A2A2A',
          borderLeft: '0px',
          transition: transitionStyle
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: '#D4FF00', borderRadius: 0 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
            <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, color: '#D4FF00' }}>NEXUS</Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
             <Typography sx={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', color: '#FFFFFF' }}>
                {activePage}
             </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 3 } }}>
            <IconButton
              onClick={() => handleNavClick('NOC Wall')}
              sx={{
                borderRadius: 0,
                border: activePage === 'NOC Wall' ? '1px solid #D4FF00' : '1px solid transparent',
                backgroundColor: activePage === 'NOC Wall' ? 'rgba(212, 255, 0, 0.05)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
              }}
            >
              <GridViewIcon sx={{ fontSize: 22, color: activePage === 'NOC Wall' ? '#D4FF00' : '#888888' }} />
            </IconButton>

            <IconButton
              onClick={openNotifications}
              sx={{ borderRadius: 0, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}
            >
              <Badge
                badgeContent={unreadCount}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#D4FF00',
                    color: '#000000',
                    fontWeight: 700,
                    fontFamily: '"Roboto Mono", monospace',
                    borderRadius: 0
                  }
                }}
              >
                <NotificationsIcon sx={{ fontSize: 22, color: unreadCount > 0 ? '#D4FF00' : '#888888' }} />
              </Badge>
            </IconButton>

            <Popover
              open={notifOpen}
              anchorEl={notifAnchorEl}
              onClose={closeNotifications}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: { xs: 340, sm: 420 },
                  maxWidth: '92vw',
                  borderRadius: 0,
                  bgcolor: '#0A0A0A',
                  border: '1px solid #2A2A2A',
                  overflow: 'hidden'
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, bgcolor: '#141414', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>
                    NOTIFICATIONS
                  </Typography>
                  <Typography sx={{ color: '#666', fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem' }}>
                    unread: {unreadCount}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  sx={{
                    borderRadius: 0,
                    border: '1px solid #2A2A2A',
                    color: unreadCount === 0 ? '#555' : '#D4FF00',
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.7rem',
                    '&:hover': { borderColor: '#444', bgcolor: 'rgba(212,255,0,0.05)' }
                  }}
                >
                  Mark all read
                </Button>
              </Box>

              <Box sx={{ px: 2, py: 1.25, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #2A2A2A' }}>
                {['ALL', 'INCIDENT', 'ALARM', 'EVENT'].map((k) => (
                  <Chip
                    key={k}
                    label={k}
                    size="small"
                    onClick={() => setNotifFilter(k)}
                    sx={{
                      borderRadius: 0,
                      bgcolor: notifFilter === k ? 'rgba(212,255,0,0.08)' : 'transparent',
                      color: notifFilter === k ? '#D4FF00' : '#888',
                      border: '1px solid #2A2A2A',
                      fontFamily: '"Roboto Mono", monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '1px',
                      height: 24,
                      '&:hover': { color: '#D4FF00', borderColor: '#444' }
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ maxHeight: 420, overflowY: 'auto', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#2A2A2A' } }}>
                {notifLoading ? (
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={36} sx={{ bgcolor: '#141414', borderRadius: 0, mb: 1 }} />
                    <Skeleton variant="rectangular" height={36} sx={{ bgcolor: '#141414', borderRadius: 0, mb: 1 }} />
                    <Skeleton variant="rectangular" height={36} sx={{ bgcolor: '#141414', borderRadius: 0 }} />
                  </Box>
                ) : notifError ? (
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ color: '#FF003C', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                      {notifError}
                    </Typography>
                    <Typography sx={{ mt: 1, color: '#666', fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem' }}>
                      Check API connectivity and try again.
                    </Typography>
                  </Box>
                ) : filteredNotifications.length === 0 ? (
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                      No notifications.
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {filteredNotifications.map((n, i) => {
                      const unread = !readIds.has(String(n.id));
                      return (
                        <React.Fragment key={n.id ?? i}>
                          <ListItem
                            disablePadding
                            onClick={() => {
                              markRead(n.id);
                              handleNavClick('Tickets');
                              closeNotifications();
                            }}
                            sx={{
                              cursor: 'pointer',
                              px: 2,
                              py: 1.5,
                              bgcolor: unread ? 'rgba(212,255,0,0.03)' : 'transparent',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                            }}
                          >
                            <Box sx={{ width: 8, alignSelf: 'stretch', mr: 1.5, bgcolor: unread ? '#D4FF00' : '#2A2A2A' }} />
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
                                <Typography sx={{ color: getLogColor(n.type), fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem', fontWeight: 700 }}>
                                  [{String(n.type || 'EVENT').toUpperCase()}] {n.source || 'N/A'}
                                </Typography>
                                <Typography sx={{ color: '#666', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem' }}>
                                  {n.ts || ''}
                                </Typography>
                              </Box>
                              <Typography sx={{ mt: 0.25, color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontSize: '0.78rem', lineHeight: 1.35, wordBreak: 'break-word' }}>
                                {n.message || '—'}
                              </Typography>
                              <Box sx={{ mt: 0.75, display: 'flex', gap: 1 }}>
                                {unread && (
                                  <Button
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markRead(n.id);
                                    }}
                                    sx={{
                                      borderRadius: 0,
                                      border: '1px solid #2A2A2A',
                                      color: '#D4FF00',
                                      fontFamily: '"Roboto Mono", monospace',
                                      fontSize: '0.65rem',
                                      px: 1,
                                      minWidth: 0,
                                      '&:hover': { borderColor: '#444', bgcolor: 'rgba(212,255,0,0.05)' }
                                    }}
                                  >
                                    Mark read
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          </ListItem>
                          {i !== filteredNotifications.length - 1 && <Divider sx={{ borderColor: '#2A2A2A' }} />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Popover>

            <Avatar sx={{ width: 36, height: 36, borderRadius: 0, bgcolor: '#D4FF00', color: '#000000', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.85rem' }}>
              SYS
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: currentWidth }, flexShrink: { sm: 0 }, transition: transitionStyle }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: currentWidth, backgroundColor: '#0D0D0D', borderRight: '1px solid #2A2A2A', transition: transitionStyle },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentWidth,
              backgroundColor: '#0D0D0D',
              borderRight: '1px solid #2A2A2A',
              transition: transitionStyle,
              overflowX: 'hidden'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { sm: `calc(100% - ${currentWidth}px)` },
          pt: { xs: `calc(${headerHeight}px + 24px)`, sm: `calc(${headerHeight}px + 32px)` },
          px: { xs: 2, sm: 4, md: 6 },
          transition: transitionStyle
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;