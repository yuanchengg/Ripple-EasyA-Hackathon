import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import Dashboard from "./components/Dashboard";
import FarmerManagement from "./components/FarmerManagement";
import EscrowManagement from "./components/EscrowManagement";
import VerificationLogs from "./components/VerificationLogs";
import XRPLConnector from "./components/XRPLConnector";

const theme = createTheme({
  palette: { primary: { main: "#2e7d32" }, secondary: { main: "#1976d2" } },
});

function TabPanel({ children, value, index }) {
  return value === index ? <Box p={3}>{children}</Box> : null;
}

export default function App() {
  const [tab, setTab] = useState(0);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }}>🌱 Climate Aid Escrow</Typography>
          <XRPLConnector />
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Dashboard" />
          <Tab label="Farmers" />
          <Tab label="Escrows" />
          <Tab label="Logs" />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <Dashboard />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <FarmerManagement />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <EscrowManagement />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <VerificationLogs />
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}
