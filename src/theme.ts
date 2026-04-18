import { createTheme } from '@mui/material/styles';

const baseComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        minHeight: '100dvh',
        overscrollBehavior: 'none',
      },
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { textTransform: 'none' as const, fontWeight: 600 },
      sizeLarge: { padding: '12px 24px', fontSize: '1rem' },
    },
  },
  MuiFab: {
    defaultProps: { color: 'primary' as const },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '6px 8px',
      },
      head: {
        fontWeight: 700,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 600 },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        marginBottom: 4,
      },
    },
  },
};

/**
 * Standard dark theme for Score Tracker.
 */
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C4DFF',
      light: '#B47CFF',
      dark: '#5C35CC',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FFD600',
      contrastText: '#000000',
    },
    error: { main: '#CF6679' },
    background: { default: '#121212', paper: '#1E1E1E' },
    text: { primary: '#FFFFFF', secondary: '#B0B0B0' },
    divider: 'rgba(255,255,255,0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    ...baseComponents,
    MuiAppBar: {
      ...baseComponents.MuiAppBar,
      styleOverrides: {
        root: {
          ...baseComponents.MuiAppBar.styleOverrides.root,
          backgroundColor: '#1E1E1E',
        },
      },
    },
    MuiFab: {
      ...baseComponents.MuiFab,
      styleOverrides: {
        root: { boxShadow: '0 4px 12px rgba(124,77,255,0.4)' },
      },
    },
  },
});

/**
 * High-contrast dark theme — WCAG AAA-friendly colours for users who need
 * maximum visibility. Pure black background, high-luminance text and accents.
 */
export const highContrastTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00CCFF',
      light: '#66DFFF',
      dark: '#0099CC',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FFD700',
      contrastText: '#000000',
    },
    error: { main: '#FF4444', contrastText: '#000000' },
    background: { default: '#000000', paper: '#111111' },
    text: { primary: '#FFFFFF', secondary: '#FFFF00' },
    divider: '#FFFFFF',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    ...baseComponents,
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderBottom: '2px solid #FFFFFF',
          backgroundColor: '#000000',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#FFFFFF', borderWidth: 2 },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFFF00' },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none' as const, fontWeight: 700, border: '2px solid transparent' },
        contained: { border: '2px solid currentColor' },
        outlined: { borderWidth: 2 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { border: '2px solid #FFFFFF', borderRadius: 8 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid #FFFFFF', padding: '6px 8px' },
        head: { fontWeight: 700 },
      },
    },
  },
});

