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
  Login as LoginIcon,
  Logout as LogoutIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { fetchDashboardMetrics, fetchLiveFeed } from '../services/api';
import { useUrlState } from '../hooks/useUrlState';
import { COLORS } from '../theme/colors';

const VALID_NOTIF_FILTERS = new Set(['ALL', 'INCIDENT', 'ALARM', 'EVENT']);

const headerHeight = 40;

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

const Layout = ({ children, activePage, setActivePage, onLogout, user, sharedData = { metrics: [], logs: [], loading: true } }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(240);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const { metrics, logs, loading: telemetryLoading } = sharedData;

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [urlParams, patchUrlParams] = useUrlState();
  const notifFilter = VALID_NOTIF_FILTERS.has(urlParams.notif_filter) ? urlParams.notif_filter : 'ALL';
  const setNotifFilter = (val) => patchUrlParams({ notif_filter: val === 'ALL' ? undefined : val });
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
    timer = setInterval(loadNotifications, 60000);
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
    if (!type) return COLORS.text;
    switch (type.toUpperCase()) {
      case 'ALARM':    return COLORS.critical;
      case 'INCIDENT': return COLORS.warn;
      case 'EVENT':    return COLORS.textMuted;
      default:         return COLORS.text;
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'row', backgroundColor: COLORS.surface, position: 'relative', overflow: 'hidden' }}>

      <Box sx={{ width: isCollapsed ? 80 : 240, flexShrink: 0, display: 'flex', flexDirection: 'column', transition: transitionStyle }}>
        <Box sx={{ height: headerHeight, display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', px: isCollapsed ? 0 : 3, borderBottom: `0px solid ${COLORS.border}` }}>
          {!isCollapsed && (
            <Typography
              variant="h5"
              noWrap
              sx={{
                color: COLORS.accentNeon,
                fontFamily: '"Roboto Mono", monospace',
                fontWeight: 700,
                letterSpacing: '-1px'
              }}
            >
              nexus.
            </Typography>
          )}
          <IconButton onClick={toggleCollapse} sx={{ color: COLORS.accentNeon, borderRadius: 0, '&:hover': { backgroundColor: 'rgba(212, 255, 0, 0.1)' } }}>
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
                  borderLeft: `2px solid ${COLORS.accentNeon}`,
                  '& .MuiListItemIcon-root': { color: COLORS.accentNeon },
                  '& .MuiListItemText-primary': { color: COLORS.accentNeon }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: COLORS.textMuted, mr: isCollapsed ? 0 : 2 }}><DashboardIcon fontSize="small" /></ListItemIcon>
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
                  borderLeft: `2px solid ${COLORS.accentNeon}`,
                  '& .MuiListItemIcon-root': { color: COLORS.accentNeon },
                  '& .MuiListItemText-primary': { color: COLORS.accentNeon }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: COLORS.textMuted, mr: isCollapsed ? 0 : 2 }}><DnsIcon fontSize="small" /></ListItemIcon>
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
                  borderLeft: `2px solid ${COLORS.accentNeon}`,
                  '& .MuiListItemIcon-root': { color: COLORS.accentNeon },
                  '& .MuiListItemText-primary': { color: COLORS.accentNeon }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: COLORS.textMuted, mr: isCollapsed ? 0 : 2 }}><QueryStatsIcon fontSize="small" /></ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={activePage === 'Observability' ? '>_ METRICS' : 'METRICS'}
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
                  borderLeft: `2px solid ${COLORS.accentNeon}`,
                  '& .MuiListItemIcon-root': { color: COLORS.accentNeon },
                  '& .MuiListItemText-primary': { color: COLORS.accentNeon }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: COLORS.textMuted, mr: isCollapsed ? 0 : 2 }}><AssignmentIcon fontSize="small" /></ListItemIcon>
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
              selected={activePage === 'Discussions'}
              onClick={() => handleNavClick('Discussions')}
              sx={{
                borderRadius: 0,
                py: 1.5,
                px: isCollapsed ? 0 : 3,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderLeft: '2px solid transparent',
                transition: 'none',
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  borderLeft: `2px solid ${COLORS.accentNeon}`,
                  '& .MuiListItemIcon-root': { color: COLORS.accentNeon },
                  '& .MuiListItemText-primary': { color: COLORS.accentNeon }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: COLORS.textMuted, mr: isCollapsed ? 0 : 2 }}><ForumIcon fontSize="small" /></ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={activePage === 'Discussions' ? '>_ DISCUSSIONS' : 'DISCUSSIONS'}
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
                  borderLeft: `2px solid ${COLORS.accentNeon}`,
                  '& .MuiListItemIcon-root': { color: COLORS.accentNeon },
                  '& .MuiListItemText-primary': { color: COLORS.accentNeon }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: COLORS.textMuted, mr: isCollapsed ? 0 : 2 }}><SmartToyIcon fontSize="small" /></ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={activePage === 'Chatbot' ? '>_ NEXUS BOT' : 'NEXUS BOT'}
                  primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px', noWrap: true }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>

        {!isCollapsed && (
          <Box sx={{ p: 2, whiteSpace: 'nowrap' }}>
            <Box sx={{ p: 1.5, borderRadius: 0, backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 0.5 }}>
                Buffer State
              </Typography>
              <Typography sx={{ color: COLORS.accentNeon, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px' }}>
                OPTIMAL
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {showExtendedPanel && (
        <Fade in={true} timeout={200}>
          <Box sx={{ flexGrow: 1, borderLeft: `1px solid ${COLORS.border}`, backgroundColor: COLORS.surface, p: 3, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', minWidth: 150 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TerminalIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} />
                <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>
                  System Stats
                </Typography>
              </Box>

              {telemetryLoading ? (
                <Box>
                  <Skeleton variant="text" width="100%" height={24} sx={{ bgcolor: COLORS.surface, mb: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={4} sx={{ bgcolor: COLORS.surface, mb: 3 }} />
                  <Skeleton variant="text" width="100%" height={24} sx={{ bgcolor: COLORS.surface, mb: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={4} sx={{ bgcolor: COLORS.surface }} />
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SpeedIcon sx={{ color: COLORS.accentNeon, fontSize: 14 }} />
                        <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>CPU_AVG</Typography>
                      </Box>
                      <Typography sx={{ color: COLORS.accentNeon, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700 }}>{cpuMetric.value}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={cpuVal} sx={{ height: 4, backgroundColor: COLORS.surface, '& .MuiLinearProgress-bar': { backgroundColor: COLORS.accentNeon } }} />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MemoryIcon sx={{ color: COLORS.warn, fontSize: 14 }} />
                        <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }}>MEM_ALLOC</Typography>
                      </Box>
                      <Typography sx={{ color: COLORS.warn, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', fontWeight: 700 }}>{memMetric.value}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={memPct} sx={{ height: 4, backgroundColor: COLORS.surface, '& .MuiLinearProgress-bar': { backgroundColor: COLORS.warn } }} />
                  </Box>
                </>
              )}
            </Box>

            <Box>
              <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 2, borderBottom: `1px solid ${COLORS.border}`, pb: 1 }}>
                Recent Logs
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {telemetryLoading ? (
                  <>
                    <Skeleton variant="rectangular" width="100%" height={32} sx={{ bgcolor: COLORS.surface, mb: 1 }} />
                    <Skeleton variant="rectangular" width="100%" height={32} sx={{ bgcolor: COLORS.surface }} />
                  </>
                ) : (
                  logs.slice(0, 4).map((log) => (
                    <Box key={log.id}>
                      <Typography sx={{ color: getLogColor(log.type), fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem', fontWeight: 700 }}>
                        [{log.type}]
                      </Typography>
                      <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem', whiteSpace: 'normal', lineHeight: 1.3 }}>
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
            backgroundColor: isResizing ? COLORS.accentNeon : 'transparent',
            transition: 'background-color 0.2s ease',
            zIndex: 10,
            '&:hover': {
              backgroundColor: COLORS.accentNeon
            }
          }}
        />
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.surface, overflowX: 'hidden' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${currentWidth}px)` },
          ml: { sm: `${currentWidth}px` },
          backgroundColor: COLORS.surface,
          height: headerHeight,
          justifyContent: 'center',
          borderBottom: `1px solid ${COLORS.border}`,
          borderLeft: '0px',
          transition: transitionStyle
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: COLORS.accentNeon, borderRadius: 0 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
            <Typography sx={{ fontFamily: '"Roboto Mono", monospace', fontWeight: 700, color: COLORS.accentNeon }}>NEXUS</Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
             <Typography sx={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.25rem', color: COLORS.text }}>
                {activePage}
             </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 3 } }}>
            <IconButton
              onClick={() => handleNavClick('NOC Wall')}
              sx={{
                borderRadius: 0,
                border: activePage === 'NOC Wall' ? `1px solid ${COLORS.accentNeon}` : '1px solid transparent',
                backgroundColor: activePage === 'NOC Wall' ? 'rgba(212, 255, 0, 0.05)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
              }}
            >
              <GridViewIcon sx={{ fontSize: 22, color: activePage === 'NOC Wall' ? COLORS.accentNeon : COLORS.textMuted }} />
            </IconButton>

            <IconButton
              onClick={openNotifications}
              sx={{ borderRadius: 0, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}
            >
              <Badge
                badgeContent={unreadCount}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: COLORS.accentNeon,
                    color: COLORS.bg,
                    fontWeight: 700,
                    fontFamily: '"Roboto Mono", monospace',
                    borderRadius: 0
                  }
                }}
              >
                <NotificationsIcon sx={{ fontSize: 22, color: unreadCount > 0 ? COLORS.accentNeon : COLORS.textMuted }} />
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
                  bgcolor: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  overflow: 'hidden'
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, bgcolor: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>
                    NOTIFICATIONS
                  </Typography>
                  <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem' }}>
                    unread: {unreadCount}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  sx={{
                    borderRadius: 0,
                    border: `1px solid ${COLORS.border}`,
                    color: unreadCount === 0 ? COLORS.border : COLORS.accentNeon,
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.7rem',
                    '&:hover': { borderColor: COLORS.border, bgcolor: 'rgba(212,255,0,0.05)' }
                  }}
                >
                  Mark all read
                </Button>
              </Box>

              <Box sx={{ px: 2, py: 1.25, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', borderBottom: `1px solid ${COLORS.border}` }}>
                {['ALL', 'INCIDENT', 'ALARM', 'EVENT'].map((k) => (
                  <Chip
                    key={k}
                    label={k}
                    size="small"
                    onClick={() => setNotifFilter(k)}
                    sx={{
                      borderRadius: 0,
                      bgcolor: notifFilter === k ? 'rgba(212,255,0,0.08)' : 'transparent',
                      color: notifFilter === k ? COLORS.accentNeon : COLORS.textMuted,
                      border: `1px solid ${COLORS.border}`,
                      fontFamily: '"Roboto Mono", monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '1px',
                      height: 24,
                      '&:hover': { color: COLORS.accentNeon, borderColor: COLORS.border }
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ maxHeight: 420, overflowY: 'auto', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { bgcolor: COLORS.border } }}>
                {notifLoading ? (
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={36} sx={{ bgcolor: COLORS.surface, borderRadius: 0, mb: 1 }} />
                    <Skeleton variant="rectangular" height={36} sx={{ bgcolor: COLORS.surface, borderRadius: 0, mb: 1 }} />
                    <Skeleton variant="rectangular" height={36} sx={{ bgcolor: COLORS.surface, borderRadius: 0 }} />
                  </Box>
                ) : notifError ? (
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ color: COLORS.critical, fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                      {notifError}
                    </Typography>
                    <Typography sx={{ mt: 1, color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem' }}>
                      Check API connectivity and try again.
                    </Typography>
                  </Box>
                ) : filteredNotifications.length === 0 ? (
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
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
                            <Box sx={{ width: 8, alignSelf: 'stretch', mr: 1.5, bgcolor: unread ? COLORS.accentNeon : COLORS.border }} />
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
                                <Typography sx={{ color: getLogColor(n.type), fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem', fontWeight: 700 }}>
                                  [{String(n.type || 'EVENT').toUpperCase()}] {n.source || 'N/A'}
                                </Typography>
                                <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem' }}>
                                  {n.ts || ''}
                                </Typography>
                              </Box>
                              <Typography sx={{ mt: 0.25, color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.78rem', lineHeight: 1.35, wordBreak: 'break-word' }}>
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
                                      border: `1px solid ${COLORS.border}`,
                                      color: COLORS.accentNeon,
                                      fontFamily: '"Roboto Mono", monospace',
                                      fontSize: '0.65rem',
                                      px: 1,
                                      minWidth: 0,
                                      '&:hover': { borderColor: COLORS.border, bgcolor: 'rgba(212,255,0,0.05)' }
                                    }}
                                  >
                                    Mark read
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          </ListItem>
                          {i !== filteredNotifications.length - 1 && <Divider sx={{ borderColor: COLORS.border }} />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Popover>

            {user?.email && (
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  mr: 1.5,
                  lineHeight: 1.1
                }}
              >
                <Typography
                  sx={{
                    color: '#D4FF00',
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '1px'
                  }}
                >
                  {user.email}
                </Typography>
                <Typography
                  sx={{
                    color: '#666',
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase'
                  }}
                >
                  {user.role || 'operator'}
                </Typography>
              </Box>
            )}

            <Tooltip title={user?.email || 'System Profile'} placement="bottom">
              <Avatar
                onClick={handleProfileClick}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '8px',
                  bgcolor: 'transparent',
                  border: `1px solid ${COLORS.accentNeon}`,
                  color: COLORS.accentNeon,
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
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                  overflow: 'hidden'
                }
              }}
            >
              <Box sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 2 }}>
  <Avatar sx={{ width: 44, height: 44, borderRadius: '8px', bgcolor: 'rgba(212,255,0,0.1)', color: COLORS.accentNeon, border: '1px solid rgba(212,255,0,0.3)' }}>
    <PersonIcon />
  </Avatar>
  <Box>
    <Typography sx={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', fontWeight: 700 }}>
      {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Not signed in'}
    </Typography>
    {user?.email && (
      <Typography sx={{ color: COLORS.accentNeon, fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem', mt: 0.25, wordBreak: 'break-all' }}>
        {user.email}
      </Typography>
    )}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
      <CircleIcon sx={{ fontSize: 8, color: user ? COLORS.accentNeon : '#666', filter: user ? `drop-shadow(0 0 4px ${COLORS.accentNeon})` : 'none' }} />
      <Typography sx={{ color: COLORS.textMuted, fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {user?.role || 'Guest Session'}
      </Typography>
    </Box>
  </Box>
</Box>

              <List sx={{ p: 1 }}>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleProfileClose} sx={{ borderRadius: '4px', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <ListItemIcon sx={{ minWidth: 32, color: COLORS.textMuted }}><SettingsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Account Settings" primaryTypographyProps={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleProfileClose} sx={{ borderRadius: '4px', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <ListItemIcon sx={{ minWidth: 32, color: COLORS.textMuted }}><PaletteIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Appearance" primaryTypographyProps={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleProfileClose} sx={{ borderRadius: '4px', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <ListItemIcon sx={{ minWidth: 32, color: COLORS.textMuted }}><MenuBookIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Documentation" primaryTypographyProps={{ color: COLORS.text, fontFamily: '"Roboto Mono", monospace', fontSize: '0.75rem' }} />
                  </ListItemButton>
                </ListItem>

                <Divider sx={{ bgcolor: COLORS.border, my: 1 }} />

                <ListItem disablePadding>
  <ListItemButton
    onClick={() => { handleProfileClose(); onLogout?.(); }}
    sx={{
      borderRadius: '4px',
      transition: 'all 0.2s',
      '&:hover': {
        bgcolor: 'rgba(255,0,60,0.1)',
        '& .MuiListItemIcon-root, & .MuiTypography-root': { color: COLORS.critical }
      }
    }}
  >
    <ListItemIcon sx={{ minWidth: 32, color: COLORS.textMuted, transition: 'color 0.2s' }}>
      <LogoutIcon fontSize="small" />
    </ListItemIcon>
    <ListItemText 
      primary="Logout Session" 
      primaryTypographyProps={{ 
        color: COLORS.textMuted, 
        fontFamily: '"Roboto Mono", monospace', 
        fontSize: '0.75rem', 
        fontWeight: 700,
        letterSpacing: '1.5px',
        transition: 'color 0.2s' 
      }} 
    />
  </ListItemButton>
</ListItem>
              </List>
            </Popover>

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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: currentWidth, backgroundColor: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, transition: transitionStyle },
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
              backgroundColor: COLORS.surface,
              borderRight: `1px solid ${COLORS.border}`,
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