import { useState } from 'react';
import { Container, Stack, Typography, Chip, Paper } from '@mui/material';
import WbSunny from '@mui/icons-material/WbSunny';
import SearchBox from './components/SearchBox';
export default function WeatherApp() { const [city, setCity] = useState(''); return <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}><Stack direction="row" spacing={2} alignItems="center"><WbSunny color="primary"/><Typography variant="h5">Realtime Weather</Typography><Chip label="LIVE WEATHER" size="small"/></Stack><Typography variant="h3" sx={{ mt: 6 }}>A little clarity for your day.</Typography><Typography color="text.secondary" sx={{ mt: 2 }}>Current conditions and the days ahead, all in one place.</Typography><Paper sx={{ p: { xs: 2, md: 4 }, mt: 4 }}><SearchBox onSearch={setCity}/><Typography sx={{ mt: 2 }}>{city ? `Ready to search ${city}` : 'Search your city to get started.'}</Typography></Paper></Container>; }
