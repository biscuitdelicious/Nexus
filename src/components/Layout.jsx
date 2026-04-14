import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Badge, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DnsIcon from '@mui/icons-material/Dns';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 280;

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <Typography
          variant="h5"
          noWrap
          sx={{
            background: 'linear-gradient(90deg, #0A84FF, #5E5CE6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 900,
            letterSpacing: '1px'
          }}
        >
          Nexus Monitor
        </Typography>
      </Box>
      <List sx={{ px: 2, flexGrow: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePage === 'Dashboard'}
            onClick={() => handleNavClick('Dashboard')}
          >
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePage === 'Devices'}
            onClick={() => handleNavClick('Devices')}
          >
            <ListItemIcon><DnsIcon /></ListItemIcon>
            <ListItemText primary="Devices" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePage === 'Observability'}
            onClick={() => handleNavClick('Observability')}
          >
            <ListItemIcon><QueryStatsIcon /></ListItemIcon>
            <ListItemText primary="Metrics & Logs" />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ p: 3 }}>
        <Box sx={{ p: 2, borderRadius: '16px', background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.1), rgba(94, 92, 230, 0.1))', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, mb: 1 }}>
            System Status
          </Typography>
          <Typography variant="subtitle2" sx={{ color: '#34c759', fontWeight: 800 }}>
            All Services Online
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: { xs: 0, sm: 24 },
          left: { xs: 0, sm: drawerWidth },
          right: 0,
          mx: 'auto',
          width: { xs: '100%', sm: 'calc(100% - 120px)' },
          maxWidth: '1000px',
          borderRadius: { xs: 0, sm: '24px' },
          height: 70,
          justifyContent: 'center',
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.08)' }
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Nexus</Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
             <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.5px' }}>
                {activePage}
             </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 800 } }}>
                <NotificationsIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>
            <Avatar src="" sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: 'primary.main', border: '2px solid rgba(255,255,255,0.1)' }} />
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
              top: 24,
              left: 24,
              height: 'calc(100vh - 48px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden'
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
          pt: { xs: 12, sm: 15 },
          px: { xs: 2, sm: 4, md: 6 }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;