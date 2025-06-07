// front/src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../services/api";

const COLORS = ["#2e7d32", "#1976d2", "#f57c00", "#d32f2f"];

const StatCard = ({ title, value, subtitle, color = "primary" }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" color={color}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch dashboard statistics");
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const practiceChartData =
    stats?.practiceStats?.map((stat) => ({
      name: stat.practice_type.replace("_", " ").toUpperCase(),
      count: stat.count,
      amount: parseFloat(stat.total_amount || 0),
    })) || [];

  const pieData =
    stats?.practiceStats?.map((stat, index) => ({
      name: stat.practice_type.replace("_", " ").toUpperCase(),
      value: stat.count,
      color: COLORS[index % COLORS.length],
    })) || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📊 Dashboard Overview
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Farmers"
            value={stats?.totalFarmers || 0}
            subtitle="Registered in system"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Escrows"
            value={stats?.totalEscrows || 0}
            subtitle="Conditional agreements"
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total XRP Locked"
            value={`${(stats?.totalAmount || 0).toFixed(2)}`}
            subtitle="In escrow contracts"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verified Practices"
            value={stats?.verifiedEscrows || 0}
            subtitle="Successfully completed"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Practice Types Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={practiceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "count" ? `${value} escrows` : `${value} XRP`,
                    name === "count" ? "Count" : "Amount",
                  ]}
                />
                <Bar dataKey="count" fill="#2e7d32" name="count" />
                <Bar dataKey="amount" fill="#1976d2" name="amount" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Practice Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Impact Summary */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          🌍 Impact Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h5" color="primary">
                {((stats?.totalAmount || 0) * 0.5).toFixed(1)} XRP
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Estimated Climate Impact Fund
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h5" color="secondary">
                {Math.round((stats?.totalFarmers || 0) * 2.3)} ha
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Estimated Land Under Resilient Practices
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h5" color="success.main">
                {Math.round((stats?.verifiedEscrows || 0) * 1.2)} tons
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Estimated CO₂ Reduction Potential
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default Dashboard;
