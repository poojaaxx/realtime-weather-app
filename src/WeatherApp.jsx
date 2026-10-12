import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Stack, Typography, Paper, Alert, CircularProgress, Box, ToggleButton, ToggleButtonGroup, Button } from '@mui/material';
import MyLocation from '@mui/icons-material/MyLocation';
import { getCurrentPosition } from './services/location';
import WbSunny from '@mui/icons-material/WbSunny';
import SearchBox from './components/SearchBox';
import InfoBox from './components/InfoBox';
import Forecast from './components/Forecast';
import { groupForecast } from './services/forecast';
import { getWeatherInfo, getWeatherByCoordinates, getForecast } from './services/weather';
export default function WeatherApp() {
 const [state, setState] = useState({ status: 'empty' }); const [unit, setUnit] = useState('C'); const [forecast, setForecast] = useState({ status: 'empty' });
 const requestId = useRef(0); const controller = useRef(null);
 const search = useCallback(async (city) => {
  const id = ++requestId.current; controller.current?.abort(); controller.current = new AbortController();
  setState({ status: 'loading' }); setForecast({ status: 'loading' });
  try { const signal = controller.current.signal;
  let weather; if (city === null) { const coordinates = await getCurrentPosition(signal); if (id !== requestId.current) return; weather = await getWeatherByCoordinates(coordinates.latitude, coordinates.longitude, signal); } else { weather = await getWeatherInfo(city, signal); } if (id !== requestId.current) return; setState({ status: 'success', weather, updatedAt: new Date() });
  try { const data = await getForecast(weather.coordinates.lat, weather.coordinates.lon, controller.current.signal); if (id === requestId.current) setForecast({ status: 'success', days: groupForecast(data.list, data.timezone) }); } catch (error) { if (id === requestId.current && error.name !== 'AbortError') setForecast({ status: 'error', error: error.message }); } }
  catch (error) { if (id === requestId.current && error.name !== 'AbortError') setState({ status: 'error', error: error.message }); }
 }, []);
 useEffect(() => { search('Chennai, IN'); return () => { ++requestId.current; controller.current?.abort(); }; }, [search]);
 return <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}><Stack direction="row" spacing={1} alignItems="center"><WbSunny color="primary"/><Typography variant="h6" component="h1">Realtime Weather</Typography></Stack><ToggleButtonGroup exclusive value={unit} onChange={(_, value) => value && setUnit(value)} size="small" aria-label="Temperature units"><ToggleButton value="C" aria-label="Celsius">{'\u00b0C'}</ToggleButton><ToggleButton value="F" aria-label="Fahrenheit">{'\u00b0F'}</ToggleButton></ToggleButtonGroup></Stack>
  <Box sx={{ mt: { xs: 5, md: 7 }, mb: 4 }}><Typography variant="overline" color="primary" sx={{ letterSpacing: 3 }}>YOUR DAILY OUTLOOK</Typography><Typography variant="h3" component="h2" sx={{ fontSize: { xs: 34, md: 52 }, mt: 1 }}>A little clarity for your day.</Typography><Typography color="text.secondary" sx={{ mt: 2 }}>Explore current conditions and plan for the days ahead.</Typography></Box>
  <Paper sx={{ p: { xs: 2, md: 3 } }}><SearchBox onSearch={search} loading={state.status === 'loading'}/><Button startIcon={<MyLocation/>} onClick={() => search(null)} sx={{ mt: 1 }}>Use my location</Button></Paper>
  <Box aria-live="polite" aria-busy={state.status === 'loading'} sx={{ mt: 3 }}>{state.status === 'loading' && <Paper sx={{ p: 5, textAlign: 'center' }}><CircularProgress aria-label="Loading weather"/><Typography sx={{ mt: 2 }}>Finding your forecast...</Typography></Paper>}{state.status === 'error' && <Alert severity="error">{state.error}</Alert>}{state.status === 'empty' && <Paper sx={{ p: 4 }}>Search a city to see current conditions.</Paper>}</Box>
  {state.status === 'success' && <><InfoBox weather={state.weather} unit={unit}/>{forecast.status === 'loading' && <Typography role="status" sx={{ mt: 3 }}>Loading forecast...</Typography>}{forecast.status === 'error' && <Alert severity="warning" sx={{ mt: 3 }}>Current conditions are available. Forecast: {forecast.error}</Alert>}{forecast.status === 'success' && <Forecast days={forecast.days} unit={unit}/>}<Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">Last updated: {state.updatedAt.toLocaleTimeString()} on this device. Wind is shown in m/s.</Typography></>}
  <Typography variant="body2" color="text.secondary" sx={{ mt: 5 }}>Weather data by <a href="https://openweathermap.org/" style={{ color: 'inherit' }}>OpenWeather</a>. Conditions can change; check again before heading out.</Typography>
 </Container>;
}
