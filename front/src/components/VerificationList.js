import React, { useState, useEffect } from 'react';
import api from '../services/api';

function VerificationList() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const response = await api.get('/verification-logs');
        setVerifications(response.data);
        setError(null);
      } catch (error) {
        setError('Failed to fetch verifications');
        console.error('Error fetching verifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifications();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Verification Logs</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Farmer</th>
              <th>Practice Type</th>
              <th>Verification Type</th>
              <th>Verified At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {verifications.map(verification => (
              <tr key={verification.id}>
                <td>{verification.farmer_name}</td>
                <td>{verification.practice_type}</td>
                <td>{verification.verification_type}</td>
                <td>{new Date(verification.verified_at).toLocaleDateString()}</td>
                <td>{verification.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VerificationList; 