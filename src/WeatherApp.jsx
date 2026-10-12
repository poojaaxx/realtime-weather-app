import { useState } from 'react';
import { Container, Stack, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import SearchBox from './components/SearchBox';
import { getWeatherInfo } from './services/weather';
export default function WeatherApp() {
 const [state, setState] = useState({ status: 'empty' });
 async function search(city) { setState({ status: 'loading' }); try { const weather = await getWeatherInfo(city); setState({ status: 'success', weather }); } catch (error) { setState({ status: 'error', error: error.message }); } }
 return <Container maxWidth="lg" sx={{ py: 5 }}><Typography variant="h3">Realtime Weather</Typography><Paper sx={{ p: 3, mt: 4 }}><SearchBox onSearch={search} loading={state.status === 'loading'}/><Stack sx={{ mt: 3 }} role="status">{state.status === 'loading' && <CircularProgress aria-label="Loading weather"/>}{state.status === 'error' && <Alert severity="error">{state.error}</Alert>}{state.status === 'empty' && <Typography>Search a city to see current conditions.</Typography>}{state.status === 'success' && <Typography>{state.weather.city}: {Math.round(state.weather.temperature)} °C · {state.weather.description}</Typography>}</Stack></Paper></Container>;
}
