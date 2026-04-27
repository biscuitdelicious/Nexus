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
  Tooltip
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
  SmartToy as SmartToyIcon,
  Forum as ForumIcon,
  NotificationsOff as NotificationsOffIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  VpnKey as VpnKeyIcon,
  Palette as PaletteIcon,
  MenuBook as MenuBookIcon,
  Logout as LogoutIcon,
  Circle as CircleIcon
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
  }
};

const Layout = ({ children, activePage, setActivePage, sharedData = { metrics: [], logs: [], loading: true } }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(240);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const { metrics, logs, loading: telemetryLoading } = sharedData;

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState('ALL');
  const [readIds, setReadIds] = useState(() => loadReadIds());

  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileOpen = Boolean(profileAnchorEl);

  const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

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
    let timer;

    const loadNotifications = async () => {
      setNotifLoading(true);
      setNotifError('');
      try {
        const items = await fetchLiveFeed();
        if (!mounted) return;
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
    timer = setInterval(loadNotifications, 15000);
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
  const layoutTransition = isResizing ? 'none' : 'width 0.3s ease, margin 0.3s ease';
  const showExtendedPanel = currentWidth > 380 && !isCollapsed;

  const cpuMetric = metrics.find(m => m.title === 'SYS.CPU_LOAD') || { value: '0%' };
  const memMetric = metrics.find(m => m.title === 'MEM.ALLOCATED') || { value: '0 GB' };

  const cpuVal = parseInt(cpuMetric.value) || 0;
  const memNum = parseFloat(memMetric.value) || 0;
  const memPct = Math.min((memNum / 16) * 100, 100);

  const navItemHoverStyle = {
    backgroundColor: 'rgba(255,255,255,0.03)',
    '& .MuiListItemIcon-root': { color: '#FFF' }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'row', backgroundColor: '#0D0D0D', position: 'relative', overflow: 'hidden' }}>

      <Box sx={{ width: isCollapsed ? 80 : 240, flexShrink: 0, display: 'flex', flexDirection: 'column', transition: layoutTransition }}>
        <Box sx={{ height: headerHeight, display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', px: isCollapsed ? 0 : 3, borderBottom: '1px solid rgba(42, 42, 42, 0.5)' }}>
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
          <IconButton onClick={toggleCollapse} sx={{ color: '#D4FF00', borderRadius: 0, transition: 'all 0.2s', '&:hover': { backgroundColor: 'rgba(212, 255, 0, 0.1)', transform: 'scale(1.1)' } }}>
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        <List sx={{ px: 0, pt: 2, flexGrow: 1 }}>
          {[
            { id: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
            { id: 'Devices', icon: <DnsIcon fontSize="small" /> },
            { id: 'Observability', icon: <QueryStatsIcon fontSize="small" /> },
            { id: 'Tickets', icon: <AssignmentIcon fontSize="small" /> },
            { id: 'Discussions', icon: <ForumIcon fontSize="small" /> },
            { id: 'Chatbot', icon: <SmartToyIcon fontSize="small" /> }
          ].map((item) => (
            <ListItem disablePadding key={item.id}>
              <ListItemButton
                selected={activePage === item.id}
                onClick={() => handleNavClick(item.id)}
                sx={{
                  borderRadius: 0,
                  py: 1.5,
                  px: isCollapsed ? 0 : 3,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderLeft: '2px solid transparent',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    background: 'linear-gradient(90deg, rgba(212, 255, 0, 0.08) 0%, rgba(212, 255, 0, 0) 100%)',
                    borderLeft: '2px solid #D4FF00',
                    '& .MuiListItemIcon-root': { color: '#D4FF00' },
                    '& .MuiListItemText-primary': { color: '#D4FF00' }
                  },
                  '&:hover': navItemHoverStyle
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: '#888888', mr: isCollapsed ? 0 : 2, transition: 'color 0.2s ease' }}>
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={activePage === item.id ? `>_ ${item.id.toUpperCase()}` : item.id.toUpperCase()}
                    primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px', noWrap: true }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {!isCollapsed && (
          <Box sx={{ p: 2, whiteSpace: 'nowrap' }}>
            <Box sx={{ p: 1.5, borderRadius: 0, backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #2A2A2A', transition: 'all 0.3s ease', '&:hover': { borderColor: '#444' } }}>
              <Typography sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 0.5 }}>
                Buffer State
              </Typography>
              <Typography sx={{ color: '#D4FF00', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#D4FF00', display: 'inline-block', boxShadow: '0 0 5px #D4FF00' }} />
                OPTIMAL
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {showExtendedPanel && (
        <Fade in={true} timeout={400}>
          <Box sx={{ flexGrow: 1, borderLeft: '1px solid rgba(42, 42, 42, 0.5)', backgroundColor: '#0a0a0a', p: 3, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', minWidth: 150 }}>
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
                    <Box key={log.id} sx={{ p: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, transition: 'background-color 0.2s' }}>
                      <Typography sx={{ color: getLogColor(log.type), fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem', fontWeight: 700 }}>
                        [{log.type}]
                      </Typography>
                      <Typography sx={{ color: '#CCC', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', whiteSpace: 'normal', lineHeight: 1.3 }}>
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
          backgroundColor: 'rgba(13, 13, 13, 0.85)',
          backdropFilter: 'blur(10px)',
          height: headerHeight,
          justifyContent: 'center',
          borderBottom: '1px solid rgba(42, 42, 42, 0.5)',
          borderLeft: '0px',
          transition: layoutTransition
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
             <Typography sx={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.35rem', color: '#FFFFFF' }}>
                {activePage}
             </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2.5 } }}>
            <Tooltip title="NOC Wall View" placement="bottom">
              <IconButton
                onClick={() => handleNavClick('NOC Wall')}
                sx={{
                  borderRadius: 0,
                  border: activePage === 'NOC Wall' ? '1px solid #D4FF00' : '1px solid transparent',
                  backgroundColor: activePage === 'NOC Wall' ? 'rgba(212, 255, 0, 0.05)' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)', transform: 'translateY(-2px)' }
                }}
              >
                <GridViewIcon sx={{ fontSize: 22, color: activePage === 'NOC Wall' ? '#D4FF00' : '#888888' }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications" placement="bottom">
              <IconButton
                onClick={openNotifications}
                sx={{
                  borderRadius: 0,
                  transition: 'all 0.2s',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)', transform: 'translateY(-2px)' }
                }}
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
            </Tooltip>

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
                  bgcolor: 'rgba(10, 10, 10, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #2A2A2A',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, bgcolor: 'transparent', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>
                    ALERTS
                  </Typography>
                  <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem' }}>
                    {unreadCount} unread
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
                    fontSize: '0.65rem',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#D4FF00', bgcolor: 'rgba(212,255,0,0.05)' }
                  }}
                >
                  Mark all read
                </Button>
              </Box>

              <Box sx={{ px: 2, py: 1.25, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #2A2A2A', bgcolor: 'rgba(20,20,20,0.5)' }}>
                {['ALL', 'INCIDENT', 'ALARM', 'EVENT'].map((k) => (
                  <Chip
                    key={k}
                    label={k}
                    size="small"
                    onClick={() => setNotifFilter(k)}
                    sx={{
                      borderRadius: 0,
                      bgcolor: notifFilter === k ? 'rgba(212,255,0,0.1)' : 'transparent',
                      color: notifFilter === k ? '#D4FF00' : '#888',
                      border: '1px solid',
                      borderColor: notifFilter === k ? '#D4FF00' : '#2A2A2A',
                      fontFamily: '"Roboto Mono", monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '1px',
                      height: 24,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': { color: '#D4FF00', borderColor: '#D4FF00' }
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ maxHeight: 420, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#2A2A2A' } }}>
                {notifLoading ? (
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={40} sx={{ bgcolor: '#141414', borderRadius: 0, mb: 1 }} />
                    <Skeleton variant="rectangular" height={40} sx={{ bgcolor: '#141414', borderRadius: 0, mb: 1 }} />
                  </Box>
                ) : notifError ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography sx={{ color: '#FF003C', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                      {notifError}
                    </Typography>
                  </Box>
                ) : filteredNotifications.length === 0 ? (
                  <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <NotificationsOffIcon sx={{ color: '#333', fontSize: 32 }} />
                    <Typography sx={{ color: '#666', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                      No alerts match this filter.
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
                              py: 2,
                              bgcolor: unread ? 'rgba(212,255,0,0.03)' : 'transparent',
                              transition: 'background-color 0.2s',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
                            }}
                          >
                            <Box sx={{ width: 4, alignSelf: 'stretch', mr: 2, bgcolor: unread ? '#D4FF00' : 'transparent', transition: 'background-color 0.3s' }} />
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 0.5 }}>
                                <Typography sx={{ color: getLogColor(n.type), fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem', fontWeight: 700 }}>
                                  [{String(n.type || 'EVENT').toUpperCase()}] {n.source || 'N/A'}
                                </Typography>
                                <Typography sx={{ color: '#555', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem' }}>
                                  {n.ts || ''}
                                </Typography>
                              </Box>
                              <Typography sx={{ color: unread ? '#FFF' : '#AAA', fontFamily: '"Roboto Mono", monospace', fontSize: '0.78rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                {n.message || '—'}
                              </Typography>
                            </Box>
                          </ListItem>
                          {i !== filteredNotifications.length - 1 && <Divider sx={{ borderColor: 'rgba(42,42,42,0.5)' }} />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Popover>

            <Tooltip title="System Profile" placement="bottom">
              <Avatar
                onClick={handleProfileClick}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '8px',
                  bgcolor: 'transparent',
                  border: '1px solid #D4FF00',
                  color: '#D4FF00',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(212, 255, 0, 0.1)',
                    boxShadow: '0 0 12px rgba(212, 255, 0, 0.4)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <PersonIcon fontSize="small" />
              </Avatar>
            </Tooltip>

            {/* --- DROPDOWN MENIU PROFIL --- */}
            <Popover
              open={isProfileOpen}
              anchorEl={profileAnchorEl}
              onClose={handleProfileClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: 240,
                  borderRadius: '8px',
                  bgcolor: 'rgba(10, 10, 10, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #2A2A2A',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                  overflow: 'hidden'
                }
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Avatar sx={{ width: 44, height: 44, borderRadius: '8px', bgcolor: 'rgba(212,255,0,0.1)', color: '#D4FF00', border: '1px solid rgba(212,255,0,0.3)' }}>
                    <PersonIcon />
                 </Avatar>
                 <Box>
                   <Typography sx={{ color: '#FFF', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', fontWeight: 700 }}>
                     admin
                   </Typography>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                     <CircleIcon sx={{ fontSize: 8, color: '#D4FF00', filter: 'drop-shadow(0 0 4px #D4FF00)' }} />
                     <Typography sx={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem' }}>
                       Admin
                     </Typography>
                   </Box>
                 </Box>
              </Box>

              <List sx={{ p: 1 }}>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleProfileClose} sx={{ borderRadius: '4px', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <ListItemIcon sx={{ minWidth: 32, color: '#888' }}><SettingsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Account Settings" primaryTypographyProps={{ color: '#DDD', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleProfileClose} sx={{ borderRadius: '4px', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <ListItemIcon sx={{ minWidth: 32, color: '#888' }}><PaletteIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Appearance" primaryTypographyProps={{ color: '#DDD', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleProfileClose} sx={{ borderRadius: '4px', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <ListItemIcon sx={{ minWidth: 32, color: '#888' }}><MenuBookIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Documentation" primaryTypographyProps={{ color: '#DDD', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }} />
                  </ListItemButton>
                </ListItem>

                <Divider sx={{ bgcolor: '#2A2A2A', my: 1 }} />

                <ListItem disablePadding>
                  <ListItemButton onClick={handleProfileClose} sx={{ borderRadius: '4px', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,0,60,0.1)', '& .MuiListItemIcon-root, & .MuiTypography-root': { color: '#FF003C' } } }}>
                    <ListItemIcon sx={{ minWidth: 32, color: '#888', transition: 'color 0.2s' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Logout Session" primaryTypographyProps={{ color: '#888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700, transition: 'color 0.2s' }} />
                  </ListItemButton>
                </ListItem>
              </List>
            </Popover>

          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: currentWidth }, flexShrink: { sm: 0 }, transition: layoutTransition }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: currentWidth, backgroundColor: '#0D0D0D', borderRight: '1px solid #2A2A2A', transition: layoutTransition },
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
              transition: layoutTransition,
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
          transition: layoutTransition
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;