// front/src/components/EscrowManagement.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Add, Lock, CheckCircle, Cancel } from "@mui/icons-material";
import { api } from "../services/api";

const PRACTICE_TYPES = [
  { value: "drought_resistant", label: "Drought-Resistant Crops" },
  { value: "water_saving", label: "Water-Saving Irrigation" },
  { value: "soil_conservation", label: "Soil Conservation" },
  { value: "agroforestry", label: "Agroforestry" },
  { value: "organic_farming", label: "Organic Farming" },
];

export default function EscrowManagement() {
  const [escrows, setEscrows] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [formData, setFormData] = useState({
    farmer_id: "",
    amount: "",
    practice_type: "",
    deadline_days: "30",
  });
  const [verifyData, setVerifyData] = useState({
    verification_data: "",
    satellite_image_url: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eRes, fRes] = await Promise.all([
        api.get("/escrows"),
        api.get("/farmers"),
      ]);
      setEscrows(eRes.data);
      setFarmers(fRes.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleVerifyInputChange = (e) => {
    const { name, value } = e.target;
    setVerifyData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/escrows", formData);
      fetchData();
      setDialogOpen(false);
      setFormData({
        farmer_id: "",
        amount: "",
        practice_type: "",
        deadline_days: "30",
      });
    } catch {
      setError("Failed to create escrow");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/escrows/${selectedEscrow.id}/verify`, verifyData);
      fetchData();
      setVerifyDialogOpen(false);
      setVerifyData({ verification_data: "", satellite_image_url: "" });
      setSelectedEscrow(null);
    } catch {
      setError("Failed to verify practice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (escrow) => {
    setSubmitting(true);
    try {
      await api.post(`/escrows/${escrow.id}/cancel`);
      fetchData();
    } catch {
      setError("Cancel failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString();

  const getPracticeLabel = (type) =>
    PRACTICE_TYPES.find((p) => p.value === type)?.label || type;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">🔒 Escrow Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Create New Escrow
        </Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Farmer</TableCell>
              <TableCell>Amount (XRP)</TableCell>
              <TableCell>Practice Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {escrows.map((esc) => (
              <TableRow key={esc.id}>
                <TableCell>{esc.id}</TableCell>
                <TableCell>{esc.farmer_name}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Lock sx={{ mr: 0.5 }} />
                    {parseFloat(esc.amount).toFixed(3)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getPracticeLabel(esc.practice_type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={esc.status.toUpperCase()}
                    color={
                      esc.status === "pending"
                        ? "warning"
                        : esc.status === "released"
                        ? "primary"
                        : esc.status === "verified"
                        ? "success"
                        : "error"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(esc.deadline)}</TableCell>
                <TableCell>
                  {esc.status === "pending" &&
                    new Date(esc.deadline) <= new Date() && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => handleCancel(esc)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    )}
                  {esc.status === "pending" &&
                    new Date(esc.deadline) > new Date() && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CheckCircle />}
                        onClick={() => {
                          setSelectedEscrow(esc);
                          setVerifyDialogOpen(true);
                        }}
                      >
                        Verify
                      </Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Escrow Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Escrow</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Farmer</InputLabel>
                  <Select
                    name="farmer_id"
                    value={formData.farmer_id}
                    onChange={handleInputChange}
                  >
                    {farmers.map((f) => (
                      <MenuItem key={f.id} value={f.id}>
                        {f.name} ({f.location})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Amount (XRP)"
                  name="amount"
                  type="number"
                  inputProps={{ step: 0.001, min: 0 }}
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Deadline (days)"
                  name="deadline_days"
                  type="number"
                  inputProps={{ min: 1, max: 365 }}
                  value={formData.deadline_days}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Practice Type</InputLabel>
                  <Select
                    name="practice_type"
                    value={formData.practice_type}
                    onChange={handleInputChange}
                  >
                    {PRACTICE_TYPES.map((p) => (
                      <MenuItem key={p.value} value={p.value}>
                        {p.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Verify Practice Dialog */}
      <Dialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Verify Practice</DialogTitle>
        <form onSubmit={handleVerify}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Verification Data"
                  name="verification_data"
                  multiline
                  rows={4}
                  value={verifyData.verification_data}
                  onChange={handleVerifyInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Satellite Image URL"
                  name="satellite_image_url"
                  value={verifyData.satellite_image_url}
                  onChange={handleVerifyInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              Release
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
