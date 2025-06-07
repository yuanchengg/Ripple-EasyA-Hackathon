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
  Card,
  CardContent,
} from "@mui/material";
import {
  Add,
  Lock,
  CheckCircle,
  Cancel,
  Visibility,
} from "@mui/icons-material";
import { api } from "../services/api";

const PRACTICE_TYPES = [
  { value: "drought_resistant", label: "Drought-Resistant Crops" },
  { value: "water_saving", label: "Water-Saving Irrigation" },
  { value: "soil_conservation", label: "Soil Conservation" },
  { value: "agroforestry", label: "Agroforestry" },
  { value: "organic_farming", label: "Organic Farming" },
];

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "warning";
    case "verified":
      return "success";
    case "released":
      return "primary";
    case "expired":
      return "error";
    default:
      return "default";
  }
};

function EscrowManagement() {
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
      const [escrowsResponse, farmersResponse] = await Promise.all([
        api.get("/escrows"),
        api.get("/farmers"),
      ]);
      setEscrows(escrowsResponse.data);
      setFarmers(farmersResponse.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVerifyInputChange = (e) => {
    const { name, value } = e.target;
    setVerifyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post("/escrows", formData);
      setEscrows((prev) => [...prev, response.data]);
      setDialogOpen(false);
      setFormData({
        farmer_id: "",
        amount: "",
        practice_type: "",
        deadline_days: "30",
      });
      setError(null);
    } catch (err) {
      setError("Failed to create escrow");
      console.error("Submit escrow error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post(
        `/escrows/${selectedEscrow.id}/verify`,
        verifyData
      );
      setEscrows((prev) =>
        prev.map((escrow) =>
          escrow.id === selectedEscrow.id
            ? {
                ...escrow,
                status: "verified",
                verified_at: new Date().toISOString(),
              }
            : escrow
        )
      );
      setVerifyDialogOpen(false);
      setVerifyData({
        verification_data: "",
        satellite_image_url: "",
      });
      setSelectedEscrow(null);
      setError(null);
    } catch (err) {
      setError("Failed to verify practice");
      console.error("Verify practice error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openVerifyDialog = (escrow) => {
    setSelectedEscrow(escrow);
    setVerifyDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPracticeLabel = (practiceType) => {
    const practice = PRACTICE_TYPES.find((p) => p.value === practiceType);
    return practice ? practice.label : practiceType;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" gutterBottom>
          🔒 Escrow Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Create New Escrow
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Escrows
              </Typography>
              <Typography variant="h5">{escrows.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Verification
              </Typography>
              <Typography variant="h5" color="warning.main">
                {escrows.filter((e) => e.status === "pending").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Verified
              </Typography>
              <Typography variant="h5" color="success.main">
                {escrows.filter((e) => e.status === "verified").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total XRP Locked
              </Typography>
              <Typography variant="h5" color="primary">
                {escrows
                  .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
                  .toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            {escrows.map((escrow) => (
              <TableRow key={escrow.id}>
                <TableCell>{escrow.id}</TableCell>
                <TableCell>{escrow.farmer_name}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Lock sx={{ mr: 1, color: "action.active" }} />
                    {parseFloat(escrow.amount).toFixed(2)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getPracticeLabel(escrow.practice_type)}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={escrow.status.toUpperCase()}
                    color={getStatusColor(escrow.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(escrow.deadline)}</TableCell>
                <TableCell>
                  {escrow.status === "pending" && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CheckCircle />}
                      onClick={() => openVerifyDialog(escrow)}
                    >
                      Verify
                    </Button>
                  )}
                  {escrow.status === "verified" && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Completed"
                      color="success"
                      size="small"
                    />
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
                  <InputLabel>Select Farmer</InputLabel>
                  <Select
                    name="farmer_id"
                    value={formData.farmer_id}
                    onChange={handleInputChange}
                    label="Select Farmer"
                  >
                    {farmers.map((farmer) => (
                      <MenuItem key={farmer.id} value={farmer.id}>
                        {farmer.name} ({farmer.location})
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
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  inputProps={{ step: 0.001, min: 0 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Deadline (days)"
                  name="deadline_days"
                  type="number"
                  value={formData.deadline_days}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1, max: 365 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Practice Type</InputLabel>
                  <Select
                    name="practice_type"
                    value={formData.practice_type}
                    onChange={handleInputChange}
                    label="Practice Type"
                  >
                    {PRACTICE_TYPES.map((practice) => (
                      <MenuItem key={practice.value} value={practice.value}>
                        {practice.label}
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
              {submitting ? <CircularProgress size={20} /> : "Create Escrow"}
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
        <DialogTitle>Verify Climate Practice</DialogTitle>
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
                  helperText="Describe the verified climate-smart practice implementation"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Satellite Image URL"
                  name="satellite_image_url"
                  value={verifyData.satellite_image_url}
                  onChange={handleVerifyInputChange}
                  helperText="URL to satellite imagery or verification photo"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              color="success"
            >
              {submitting ? <CircularProgress size={20} /> : "Verify Practice"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default EscrowManagement;
