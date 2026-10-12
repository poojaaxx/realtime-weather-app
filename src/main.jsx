import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import WeatherApp from './WeatherApp';
import './styles.css';
const theme = createTheme({ palette: { mode: 'dark', primary: { main: '#80ded1' }, background: { default: '#0a1829', paper: '#12243a' } }, typography: { fontFamily: 'Inter, Segoe UI, sans-serif', h3: { fontWeight: 700 }, h5: { fontWeight: 650 } }, shape: { borderRadius: 20 }, components: { MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 12 } } }, MuiCard: { styleOverrides: { root: { backgroundImage: 'none' } } } } });
createRoot(document.getElementById('root')).render(<React.StrictMode><ThemeProvider theme={theme}><CssBaseline/><WeatherApp/></ThemeProvider></React.StrictMode>);
