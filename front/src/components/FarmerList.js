import React, { useState, useEffect } from 'react';
import api from '../services/api';

function FarmerList() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await api.get('/farmers');
        setFarmers(response.data);
        setError(null);
      } catch (error) {
        setError('Failed to fetch farmers');
        console.error('Error fetching farmers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Farmers</h1>
      <div className="card">
        <table>
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
            {farmers.map(farmer => (
              <tr key={farmer.id}>
                <td>{farmer.name}</td>
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

export default FarmerList; 