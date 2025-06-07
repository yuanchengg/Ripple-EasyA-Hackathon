import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function FarmerList() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await api.get("/farmers");
        setFarmers(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching farmers:", err);
        setError("Failed to fetch farmers");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  if (loading) return <div>Loading farmers…</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="farmer-list-page">
      <h1>Farmers</h1>
      <div className="card">
        <table className="farmer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Farm Size (ha)</th>
              <th>Primary Crop</th>
              <th>XRP Address</th>
            </tr>
          </thead>
          <tbody>
            {farmers.map((farmer) => (
              <tr key={farmer.id}>
                <td>
                  {/* Clicking a name takes you to /farmers/:id */}
                  <Link to={`/farmers/${farmer.id}`}>{farmer.name}</Link>
                </td>
                <td>{farmer.location}</td>
                <td>{farmer.farm_size}</td>
                <td>{farmer.primary_crop}</td>
                <td>{farmer.xrp_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
