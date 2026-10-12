import { useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import Search from '@mui/icons-material/Search';
export const validateCity = (value) => value.trim().length < 2 ? 'Enter at least two characters for a city.' : value.trim().length > 100 ? 'Use 100 characters or fewer.' : '';
export default function SearchBox({ onSearch, loading = false }) {
  const [city, setCity] = useState('');
  const [touched, setTouched] = useState(false);
  const error = validateCity(city);
  function submit(event) { event.preventDefault(); setTouched(true); if (!error) onSearch(city.trim()); }
  return <Stack component="form" onSubmit={submit} direction={{ xs: 'column', sm: 'row' }} spacing={2} noValidate><TextField fullWidth label="City name" placeholder="e.g. Chennai, IN" value={city} onChange={(event) => { setCity(event.target.value); setTouched(true); }} error={touched && !!error} helperText={touched && error ? error : 'Add a country code to narrow your search.'} inputProps={{ maxLength: 101 }} /><Button type="submit" variant="contained" startIcon={<Search/>} disabled={!!error} sx={{ minWidth: 140, alignSelf: { sm: 'flex-start' }, height: 56 }}>{loading ? 'Search again' : 'Find weather'}</Button></Stack>;
}
