// front/src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalEscrows: 0,
    totalAmount: 0,
    verifiedEscrows: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="card">
          <h3>Total Farmers</h3>
          <p className="stat-value">{stats.totalFarmers}</p>
          <p className="stat-subtitle">Registered in system</p>
        </div>
        <div className="card">
          <h3>Active Escrows</h3>
          <p className="stat-value">{stats.totalEscrows}</p>
          <p className="stat-subtitle">Conditional agreements</p>
        </div>
        <div className="card">
          <h3>Total XRP Locked</h3>
          <p className="stat-value">{stats.totalAmount.toFixed(2)}</p>
          <p className="stat-subtitle">In escrow contracts</p>
        </div>
        <div className="card">
          <h3>Verified Practices</h3>
          <p className="stat-value">{stats.verifiedEscrows}</p>
          <p className="stat-subtitle">Successfully completed</p>
        </div>
      </div>

      <div className="impact-section">
        <h2>Environmental Impact</h2>
        <div className="stats-grid">
          <div className="card">
            <h3>Carbon Reduction</h3>
            <p className="stat-value">{(stats.totalAmount * 0.5).toFixed(1)} tons</p>
            <p className="stat-subtitle">CO₂ equivalent</p>
          </div>
          <div className="card">
            <h3>Land Area</h3>
            <p className="stat-value">{Math.round(stats.totalFarmers * 2.3)} ha</p>
            <p className="stat-subtitle">Under sustainable practices</p>
          </div>
          <div className="card">
            <h3>Water Saved</h3>
            <p className="stat-value">{Math.round(stats.verifiedEscrows * 1.2)} tons</p>
            <p className="stat-subtitle">Through efficient irrigation</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
