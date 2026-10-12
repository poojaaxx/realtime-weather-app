import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Stack, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import SearchBox from './components/SearchBox';
import InfoBox from './components/InfoBox';
import { getWeatherInfo } from './services/weather';
export default function WeatherApp() {
 const [state, setState] = useState({ status: 'empty' });
 const requestId = useRef(0); const controller = useRef(null);
 const search = useCallback(async (city) => {
  const id = ++requestId.current; controller.current?.abort(); controller.current = new AbortController();
  setState({ status: 'loading' });
  try { const weather = await getWeatherInfo(city, controller.current.signal); if (id === requestId.current) setState({ status: 'success', weather, updatedAt: new Date() }); }
  catch (error) { if (id === requestId.current && error.name !== 'AbortError') setState({ status: 'error', error: error.message }); }
 }, []);
 useEffect(() => { search('Chennai, IN'); return () => { ++requestId.current; controller.current?.abort(); }; }, [search]);
 return <Container maxWidth="lg" sx={{ py: 5 }}><Typography variant="h3">Realtime Weather</Typography><Paper sx={{ p: 3, mt: 4 }}><SearchBox onSearch={search} loading={state.status === 'loading'}/><Stack sx={{ mt: 3 }} role="status">{state.status === 'loading' && <CircularProgress aria-label="Loading weather"/>}{state.status === 'error' && <Alert severity="error">{state.error}</Alert>}{state.status === 'empty' && <Typography>Search a city to see current conditions.</Typography>}</Stack></Paper>{state.status === 'success' && <><InfoBox weather={state.weather}/><Typography sx={{ mt: 2 }} color="text.secondary">Last updated: {state.updatedAt.toLocaleTimeString()}</Typography></>}</Container>;
}
