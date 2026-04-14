import { createTheme } from '@mui/material/styles';

const glassTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A84FF',
    },
    secondary: {
      main: '#5E5CE6',
    },
    background: {
      default: '#05050A',
      paper: 'rgba(20, 20, 25, 0.45)',
    },
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(circle at 15% 50%, #1a1a2e 0%, #05050A 50%, #000000 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          backgroundColor: 'rgba(25, 25, 32, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          backgroundColor: 'rgba(10, 10, 15, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          backgroundColor: 'rgba(10, 10, 15, 0.5)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '10px 0 30px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '14px',
          margin: '6px 12px',
          padding: '10px 16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid transparent',
          '&.Mui-selected': {
            backgroundColor: 'rgba(10, 132, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(10, 132, 255, 0.3)',
            boxShadow: '0 4px 20px rgba(10, 132, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(10, 132, 255, 0.25)',
              transform: 'scale(1.02)',
            },
            '& .MuiListItemIcon-root': {
              color: '#0A84FF',
            },
            '& .MuiListItemText-primary': {
              color: '#ffffff',
              fontWeight: 700,
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            transform: 'translateX(4px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '8px 20px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(10, 132, 255, 0.4)',
          },
        },
        contained: {
          backgroundImage: 'linear-gradient(135deg, #0A84FF 0%, #0056b3 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 10,
          backdropFilter: 'blur(10px)',
        },
        outlined: {
          borderWidth: '1px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

export default glassTheme;