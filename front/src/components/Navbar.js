import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon, AccountBalance as AccountBalanceIcon, VerifiedUser as VerifiedUserIcon, Person as PersonIcon } from '@mui/icons-material';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Climate Aid Escrow
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/farmers"
            startIcon={<PersonIcon />}
          >
            Farmers
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/escrows"
            startIcon={<AccountBalanceIcon />}
          >
            Escrows
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/verifications"
            startIcon={<VerifiedUserIcon />}
          >
            Verifications
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 