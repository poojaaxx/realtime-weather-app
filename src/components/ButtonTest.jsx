import { Button, Stack } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Send from '@mui/icons-material/Send';
export default function ButtonTest() { return <Stack direction="row" spacing={2}><Button color="error" variant="contained" startIcon={<Delete/>}>Delete</Button><Button color="success" variant="contained" startIcon={<Send/>}>Submit</Button><Button variant="outlined" disabled>Disabled</Button></Stack>; }
