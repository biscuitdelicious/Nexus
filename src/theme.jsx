import { createTheme } from '@mui/material/styles';

const terminalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#CCFF00',
      contrastText: '#000000',
    },
    secondary: {
      main: '#00E5FF',
      contrastText: '#000000',
    },
    background: {
      default: '#050505',
      paper: '#0A0A0A',
    },
    text: {
      primary: '#EAEAEA',
      secondary: '#A1A1AA',
    },
    divider: '#1F1F1F',
  },
  shape: {
    borderRadius: 2,
  },
  typography: {
    fontFamily: [
      '"Roboto Mono"',
      '"Fira Code"',
      'monospace',
    ].join(','),
    h1: { fontWeight: 700, letterSpacing: '-1px', textTransform: 'uppercase' },
    h2: { fontWeight: 700, letterSpacing: '-0.5px', textTransform: 'uppercase' },
    h3: { fontWeight: 600, textTransform: 'uppercase' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600, color: '#EAEAEA' },
    h6: { fontWeight: 600 },
    subtitle1: { textTransform: 'uppercase', letterSpacing: '1.5px', color: '#00E5FF', fontWeight: 600 },
    subtitle2: { textTransform: 'uppercase', letterSpacing: '1px', color: '#A1A1AA' },
    body1: { letterSpacing: '0.2px' },
    body2: { letterSpacing: '0.2px' },
    button: { fontWeight: 700, letterSpacing: '1.5px' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#050505',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #111111 0%, #050505 70%)',
          minHeight: '100vh',
          color: '#EAEAEA',
          textRendering: 'optimizeLegibility',
        },
        '::selection': {
          backgroundColor: '#CCFF00',
          color: '#000000',
        },
        '*::-webkit-scrollbar': {
          width: '6px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#1F1F1F',
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: '#CCFF00',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0A0A0A',
          border: '1px solid #1F1F1F',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(5, 5, 5, 0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #1F1F1F',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#050505',
          borderRight: '1px solid #1F1F1F',
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: '4px 8px',
          padding: '8px 16px',
          borderLeft: '2px solid transparent',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: 'rgba(204, 255, 0, 0.08)',
            borderLeft: '2px solid #CCFF00',
            '&:hover': {
              backgroundColor: 'rgba(204, 255, 0, 0.12)',
            },
            '& .MuiListItemIcon-root': {
              color: '#CCFF00',
              filter: 'drop-shadow(0 0 6px rgba(204, 255, 0, 0.5))',
            },
            '& .MuiListItemText-primary': {
              color: '#CCFF00',
              fontWeight: 600,
            },
          },
          '&:hover': {
            backgroundColor: '#111111',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#A1A1AA',
          minWidth: '40px',
          transition: 'color 0.2s ease',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontSize: '0.85rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          borderRadius: 2,
          padding: '10px 24px',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          backgroundColor: '#CCFF00',
          color: '#000000',
          boxShadow: '0 0 10px rgba(204, 255, 0, 0.15)',
          '&:hover': {
            backgroundColor: '#B3E600',
            boxShadow: '0 0 20px rgba(204, 255, 0, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        outlinedPrimary: {
          borderColor: '#CCFF00',
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
            backgroundColor: 'rgba(204, 255, 0, 0.1)',
            boxShadow: '0 0 12px rgba(204, 255, 0, 0.2)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#111111',
          border: '1px solid #1F1F1F',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#1A1A1A',
          },
        },
        outlined: {
          backgroundColor: 'transparent',
          borderColor: '#1F1F1F',
        },
      },
    },
  },
});

export default terminalTheme;