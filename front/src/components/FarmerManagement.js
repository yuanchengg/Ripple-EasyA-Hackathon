// front/src/components/FarmerManagement.js
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
} from "@mui/material";
import { Add, Person, LocationOn } from "@mui/icons-material";
import { api } from "../services/api";

function FarmerManagement() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    xrp_address: "",
    farm_size: "",
    primary_crop: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/farmers");
      setFarmers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch farmers");
      console.error("Fetch farmers error:", err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post("/farmers", formData);
      setFarmers((prev) => [...prev, response.data]);
      setDialogOpen(false);
      setFormData({
        name: "",
        location: "",
        xrp_address: "",
        farm_size: "",
        primary_crop: "",
      });
      setError(null);
    } catch (err) {
      setError("Failed to register farmer");
      console.error("Submit farmer error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
          👨‍🌾 Farmer Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Register New Farmer
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>XRP Address</TableCell>
              <TableCell>Farm Size (ha)</TableCell>
              <TableCell>Primary Crop</TableCell>
              <TableCell>Registered</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {farmers.map((farmer) => (
              <TableRow key={farmer.id}>
                <TableCell>{farmer.id}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Person sx={{ mr: 1, color: "action.active" }} />
                    {farmer.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <LocationOn sx={{ mr: 1, color: "action.active" }} />
                    {farmer.location}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={farmer.xrp_address}
                    variant="outlined"
                    size="small"
                    sx={{ fontFamily: "monospace" }}
                  />
                </TableCell>
                <TableCell>{farmer.farm_size}</TableCell>
                <TableCell>
                  <Chip
                    label={farmer.primary_crop}
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatDate(farmer.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Registration Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Register New Farmer</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Farmer Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  helperText="e.g., Kenya, Maharashtra, Philippines"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="XRP Address"
                  name="xrp_address"
                  value={formData.xrp_address}
                  onChange={handleInputChange}
                  required
                  helperText="XRPL wallet address for receiving escrow funds"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Farm Size (hectares)"
                  name="farm_size"
                  type="number"
                  value={formData.farm_size}
                  onChange={handleInputChange}
                  inputProps={{ step: 0.1, min: 0 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Primary Crop"
                  name="primary_crop"
                  value={formData.primary_crop}
                  onChange={handleInputChange}
                  helperText="e.g., Rice, Wheat, Maize"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Register Farmer"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default FarmerManagement;
