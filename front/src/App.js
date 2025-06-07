// front/src/App.js
import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container, Tabs, Tab, Box } from '@mui/material';
import Dashboard from './components/Dashboard';
import FarmerManagement from './components/FarmerManagement';
import EscrowManagement from './components/EscrowManagement';
import VerificationLogs from './components/VerificationLogs';
import XRPLConnector from './components/XRPLConnector';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green theme for sustainability
    },
    secondary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🌱 Climate Aid Escrow System
          </Typography>
          <XRPLConnector />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="system tabs">
            <Tab label="Dashboard" />
            <Tab label="Farmers" />
            <Tab label="Escrows" />
            <Tab label="Verification Logs" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Dashboard />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <FarmerManagement />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <EscrowManagement />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <VerificationLogs />
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}

export default App;