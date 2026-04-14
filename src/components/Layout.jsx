import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Badge, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DnsIcon from '@mui/icons-material/Dns';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 260;

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
    <Box>
      <Toolbar sx={{ mb: 2 }} />
      <List>
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
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', height: 70 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h5"
              noWrap
              component="div"
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton sx={{ p: 0, ml: 1 }}>
              <Avatar alt="Admin User" src="" sx={{ width: 36, height: 36, bgcolor: 'primary.main' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          pt: 12
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;