import { createTheme } from '@mui/material/styles';

const terminalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4FF00',
      contrastText: '#000000',
    },
    secondary: {
      main: '#888888',
    },
    background: {
      default: '#0D0D0D',
      paper: '#141414',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#888888',
    },
    divider: '#2A2A2A',
  },
  shape: {
    borderRadius: 0,
  },
  typography: {
    fontFamily: [
      '"Roboto Mono"',
      '"Courier New"',
      'monospace',
    ].join(','),
    h1: { fontFamily: '"Georgia", serif', fontStyle: 'italic' },
    h2: { fontFamily: '"Georgia", serif', fontStyle: 'italic' },
    h3: { fontFamily: '"Georgia", serif', fontStyle: 'italic' },
    h4: { fontFamily: '"Georgia", serif', fontStyle: 'italic' },
    h5: { fontFamily: '"Georgia", serif', fontStyle: 'italic', color: '#FFFFFF' },
    h6: { fontFamily: '"Georgia", serif', fontStyle: 'italic' },
    subtitle1: { fontFamily: '"Roboto Mono", monospace', textTransform: 'uppercase', letterSpacing: '1px' },
    subtitle2: { fontFamily: '"Roboto Mono", monospace', textTransform: 'uppercase', letterSpacing: '1px', color: '#888888' },
    body1: { fontFamily: '"Roboto Mono", monospace' },
    body2: { fontFamily: '"Roboto Mono", monospace' },
    button: { fontFamily: '"Roboto Mono", monospace', fontWeight: 700, letterSpacing: '1px' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0D0D0D',
          backgroundImage: 'none',
          minHeight: '100vh',
          color: '#FFFFFF',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#0D0D0D',
          borderLeft: '1px solid #2A2A2A',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#2A2A2A',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#141414',
          border: '1px solid #2A2A2A',
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0D0D0D',
          borderBottom: '1px solid #2A2A2A',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#0D0D0D',
          borderRight: '1px solid #2A2A2A',
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          margin: '4px 0',
          padding: '10px 24px',
          borderLeft: '2px solid transparent',
          transition: 'none',
          '&.Mui-selected': {
            backgroundColor: 'transparent',
            borderLeft: '2px solid #D4FF00',
            '&:hover': {
              backgroundColor: 'rgba(212, 255, 0, 0.05)',
            },
            '& .MuiListItemIcon-root': {
              color: '#D4FF00',
            },
            '& .MuiListItemText-primary': {
              color: '#D4FF00',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#888888',
          minWidth: '40px',
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
          fontWeight: 700,
          borderRadius: 0,
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#D4FF00',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#BDE600',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: '#141414',
          border: '1px solid #2A2A2A',
        },
        outlined: {
          backgroundColor: 'transparent',
        },
      },
    },
  },
});

export default terminalTheme;