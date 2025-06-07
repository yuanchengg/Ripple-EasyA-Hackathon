// front/src/components/VerificationLogs.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  Link,
} from "@mui/material";
import { CheckCircle, Satellite, Image } from "@mui/icons-material";
import { api } from "../services/api";

function VerificationLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVerificationLogs();
  }, []);

  const fetchVerificationLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/verification-logs");
      setLogs(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch verification logs");
      console.error("Fetch verification logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getVerificationIcon = (type) => {
    switch (type) {
      case "satellite":
        return <Satellite />;
      case "iot":
        return <CheckCircle />;
      case "manual":
        return <Image />;
      default:
        return <CheckCircle />;
    }
  };

  const getPracticeColor = (practiceType) => {
    const colors = {
      drought_resistant: "error",
      water_saving: "info",
      soil_conservation: "warning",
      agroforestry: "success",
      organic_farming: "primary",
    };
    return colors[practiceType] || "default";
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
      <Typography variant="h4" gutterBottom>
        ✅ Verification Logs
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Track all verified climate-smart farming practices and their impact
        validation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">{logs.length}</Typography>
                  <Typography color="textSecondary">
                    Total Verifications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: "info.main", mr: 2 }}>
                  <Satellite />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {
                      logs.filter(
                        (log) => log.verification_type === "satellite"
                      ).length
                    }
                  </Typography>
                  <Typography color="textSecondary">
                    Satellite Verified
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}>💰</Avatar>
                <Box>
                  <Typography variant="h6">
                    {logs
                      .reduce(
                        (sum, log) => sum + parseFloat(log.amount || 0),
                        0
                      )
                      .toFixed(2)}{" "}
                    XRP
                  </Typography>
                  <Typography color="textSecondary">
                    Released to Farmers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Verification ID</TableCell>
              <TableCell>Farmer</TableCell>
              <TableCell>Practice Type</TableCell>
              <TableCell>Amount (XRP)</TableCell>
              <TableCell>Verification Type</TableCell>
              <TableCell>Verified Date</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getVerificationIcon(log.verification_type)}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      #{log.id}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {log.farmer_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.practice_type.replace("_", " ").toUpperCase()}
                    color={getPracticeColor(log.practice_type)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color="success.main"
                  >
                    {parseFloat(log.amount || 0).toFixed(2)} XRP
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.verification_type.toUpperCase()}
                    color="info"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(log.verified_at)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    {log.verification_data && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mb: 1 }}
                      >
                        {log.verification_data.length > 50
                          ? `${log.verification_data.substring(0, 50)}...`
                          : log.verification_data}
                      </Typography>
                    )}
                    {log.satellite_image_url && (
                      <Link
                        href={log.satellite_image_url}
                        target="_blank"
                        rel="noopener"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        📸 View Evidence
                      </Link>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary" sx={{ py: 4 }}>
                    No verification logs found. Start by creating and verifying
                    escrows.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Impact Summary */}
      {logs.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🌍 Verification Impact Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" color="primary">
                    {logs.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Practices Verified
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" color="success.main">
                    {new Set(logs.map((log) => log.farmer_name)).size}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Farmers Benefited
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" color="info.main">
                    {Math.round(logs.length * 2.1)} ha
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Est. Land Improved
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" color="warning.main">
                    {Math.round(logs.length * 1.8)} tons
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Est. CO₂ Reduction
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default VerificationLogs;
