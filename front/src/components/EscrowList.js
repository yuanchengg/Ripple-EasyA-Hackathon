import React, { useState, useEffect } from 'react';
import api from '../services/api';

function EscrowList() {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEscrows = async () => {
      try {
        const response = await api.get('/escrows');
        setEscrows(response.data);
        setError(null);
      } catch (error) {
        setError('Failed to fetch escrows');
        console.error('Error fetching escrows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEscrows();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Escrows</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Farmer</th>
              <th>Amount (XRP)</th>
              <th>Practice Type</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Verified At</th>
            </tr>
          </thead>
          <tbody>
            {escrows.map(escrow => (
              <tr key={escrow.id}>
                <td>{escrow.farmer_name}</td>
                <td>{escrow.amount}</td>
                <td>{escrow.practice_type}</td>
                <td>{escrow.status}</td>
                <td>{new Date(escrow.deadline).toLocaleDateString()}</td>
                <td>{escrow.verified_at ? new Date(escrow.verified_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EscrowList; 