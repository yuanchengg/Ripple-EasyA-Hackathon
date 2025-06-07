import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { getEscrows, verifyEscrow } from '../services/api';

export default function VerificationPage() {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      const response = await getEscrows();
      setEscrows(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch escrows');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleApprove = async (escrow) => {
    try {
      setApprovingId(escrow.id);
      await verifyEscrow(escrow.id, {
        verification_data: 'Automatically approved',
        satellite_image_url: 'N/A'
      });
      await fetchEscrows();
      setError(null);
    } catch (err) {
      setError('Failed to approve escrow');
    } finally {
      setApprovingId(null);
    }
  };

  const filteredEscrows = escrows.filter((escrow) => {
    const farmerName = escrow.farmer_name?.toLowerCase() || '';
    const practiceType = escrow.practice_type?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return farmerName.includes(query) || practiceType.includes(query);
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Escrow Approvals
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by farmer name or practice type..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Farmer Name</TableCell>
                <TableCell>Practice Type</TableCell>
                <TableCell>Amount (XRP)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEscrows.map((escrow) => (
                <TableRow key={escrow.id}>
                  <TableCell>{escrow.farmer_name}</TableCell>
                  <TableCell>{escrow.practice_type}</TableCell>
                  <TableCell>{escrow.amount}</TableCell>
                  <TableCell>{escrow.status}</TableCell>
                  <TableCell>
                    {new Date(escrow.deadline).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {escrow.status === 'pending' && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={approvingId === escrow.id ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                        onClick={() => handleApprove(escrow)}
                        disabled={approvingId === escrow.id}
                      >
                        {approvingId === escrow.id ? 'Approving...' : 'Approve & Release'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
} 