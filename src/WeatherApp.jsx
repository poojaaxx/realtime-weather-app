import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Stack, Typography, Paper, Alert, CircularProgress, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import WbSunny from '@mui/icons-material/WbSunny';
import SearchBox from './components/SearchBox';
import InfoBox from './components/InfoBox';
import { getWeatherInfo } from './services/weather';
export default function WeatherApp() {
 const [state, setState] = useState({ status: 'empty' }); const [unit, setUnit] = useState('C');
 const requestId = useRef(0); const controller = useRef(null);
 const search = useCallback(async (city) => {
  const id = ++requestId.current; controller.current?.abort(); controller.current = new AbortController();
  setState({ status: 'loading' });
  try { const weather = await getWeatherInfo(city, controller.current.signal); if (id === requestId.current) setState({ status: 'success', weather, updatedAt: new Date() }); }
  catch (error) { if (id === requestId.current && error.name !== 'AbortError') setState({ status: 'error', error: error.message }); }
 }, []);
 useEffect(() => { search('Chennai, IN'); return () => { ++requestId.current; controller.current?.abort(); }; }, [search]);
 return <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}><Stack direction="row" spacing={1} alignItems="center"><WbSunny color="primary"/><Typography variant="h6" component="h1">Realtime Weather</Typography></Stack><ToggleButtonGroup exclusive value={unit} onChange={(_, value) => value && setUnit(value)} size="small" aria-label="Temperature units"><ToggleButton value="C" aria-label="Celsius">{'\u00b0C'}</ToggleButton><ToggleButton value="F" aria-label="Fahrenheit">{'\u00b0F'}</ToggleButton></ToggleButtonGroup></Stack>
  <Box sx={{ mt: { xs: 5, md: 7 }, mb: 4 }}><Typography variant="overline" color="primary" sx={{ letterSpacing: 3 }}>YOUR DAILY OUTLOOK</Typography><Typography variant="h3" component="h2" sx={{ fontSize: { xs: 34, md: 52 }, mt: 1 }}>A little clarity for your day.</Typography><Typography color="text.secondary" sx={{ mt: 2 }}>Explore current conditions and plan for the days ahead.</Typography></Box>
  <Paper sx={{ p: { xs: 2, md: 3 } }}><SearchBox onSearch={search} loading={state.status === 'loading'}/></Paper>
  <Box aria-live="polite" aria-busy={state.status === 'loading'} sx={{ mt: 3 }}>{state.status === 'loading' && <Paper sx={{ p: 5, textAlign: 'center' }}><CircularProgress aria-label="Loading weather"/><Typography sx={{ mt: 2 }}>Finding your forecast...</Typography></Paper>}{state.status === 'error' && <Alert severity="error">{state.error}</Alert>}{state.status === 'empty' && <Paper sx={{ p: 4 }}>Search a city to see current conditions.</Paper>}</Box>
  {state.status === 'success' && <><InfoBox weather={state.weather} unit={unit}/><Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">Last updated: {state.updatedAt.toLocaleTimeString()} on this device. Wind is shown in m/s.</Typography></>}
  <Typography variant="body2" color="text.secondary" sx={{ mt: 5 }}>Weather data by <a href="https://openweathermap.org/" style={{ color: 'inherit' }}>OpenWeather</a>. Conditions can change; check again before heading out.</Typography>
 </Container>;
}
