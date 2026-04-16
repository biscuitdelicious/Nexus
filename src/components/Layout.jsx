import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Badge, Avatar } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Dns as DnsIcon,
  QueryStats as QueryStatsIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

const drawerWidth = 280;
const headerHeight = 80;

const Layout = ({ children, activePage, setActivePage }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0D0D0D' }}>
      <Box sx={{ height: headerHeight, display: 'flex', alignItems: 'center', px: 4, borderBottom: '0px solid #2A2A2A' }}>
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
      </Box>
      <List sx={{ px: 0, pt: 2, flexGrow: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePage === 'Dashboard'}
            onClick={() => handleNavClick('Dashboard')}
            sx={{
              borderRadius: 0,
              py: 1.5,
              px: 4,
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
            <ListItemIcon sx={{ minWidth: 40, color: '#888888' }}><DashboardIcon fontSize="small" /></ListItemIcon>
            <ListItemText
              primary={activePage === 'Dashboard' ? '>_ DASHBOARD' : 'DASHBOARD'}
              primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px' }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePage === 'Devices'}
            onClick={() => handleNavClick('Devices')}
            sx={{
              borderRadius: 0,
              py: 1.5,
              px: 4,
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
            <ListItemIcon sx={{ minWidth: 40, color: '#888888' }}><DnsIcon fontSize="small" /></ListItemIcon>
            <ListItemText
              primary={activePage === 'Devices' ? '>_ DEVICES' : 'DEVICES'}
              primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px' }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePage === 'Observability'}
            onClick={() => handleNavClick('Observability')}
            sx={{
              borderRadius: 0,
              py: 1.5,
              px: 4,
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
            <ListItemIcon sx={{ minWidth: 40, color: '#888888' }}><QueryStatsIcon fontSize="small" /></ListItemIcon>
            <ListItemText
              primary={activePage === 'Observability' ? '>_ METRICS & LOGS' : 'METRICS & LOGS'}
              primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px' }}
            />
          </ListItemButton>
        </ListItem>

          <ListItem disablePadding>
          <ListItemButton
            selected={activePage === 'Tickets'}
            onClick={() => handleNavClick('Tickets')}
            sx={{
              borderRadius: 0,
              py: 1.5,
              px: 4,
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
            <ListItemIcon sx={{ minWidth: 40, color: '#888888' }}><QueryStatsIcon fontSize="small" /></ListItemIcon>
            <ListItemText
              primary={activePage === 'Tickets' ? '>_ TICKETS' : 'TICKETS'}
              primaryTypographyProps={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px' }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ p: 3 }}>
        <Box sx={{ p: 2, borderRadius: 0, backgroundColor: '#141414', border: '1px solid #2A2A2A' }}>
          <Typography sx={{ color: '#888888', fontFamily: '"Roboto Mono", monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
            Buffer State
          </Typography>
          <Typography sx={{ color: '#D4FF00', fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', letterSpacing: '1px' }}>
            OPTIMAL
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D0D0D' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#0D0D0D',
          height: headerHeight,
          justifyContent: 'center',
          borderBottom: '1px solid #2A2A2A',
            borderLeft:'0px'
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton sx={{ borderRadius: 0, '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
              <Badge badgeContent={3} sx={{ '& .MuiBadge-badge': { backgroundColor: '#D4FF00', color: '#000000', fontWeight: 700, fontFamily: '"Roboto Mono", monospace', borderRadius: 0 } }}>
                <NotificationsIcon sx={{ fontSize: 22, color: '#888888' }} />
              </Badge>
            </IconButton>
            <Avatar sx={{ width: 36, height: 36, borderRadius: 0, bgcolor: '#D4FF00', color: '#000000', fontFamily: '"Roboto Mono", monospace', fontWeight: 700, fontSize: '0.85rem' }}>
              SYS
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#0D0D0D', borderRight: '1px solid #2A2A2A' },
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
              width: drawerWidth,
              backgroundColor: '#0D0D0D',
              borderRight: '1px solid #2A2A2A'
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          pt: { xs: `calc(${headerHeight}px + 24px)`, sm: `calc(${headerHeight}px + 32px)` },
          px: { xs: 2, sm: 4, md: 6 }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;