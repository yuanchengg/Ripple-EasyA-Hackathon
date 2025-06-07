import React, { useState, useEffect } from 'react';
import api from '../services/api';

function CreateEscrow() {
  const [farmers, setFarmers] = useState([]);
  const [formData, setFormData] = useState({
    farmer_id: '',
    amount: '',
    practice_type: '',
    deadline_days: '30'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await api.get('/farmers');
        setFarmers(response.data);
      } catch (error) {
        console.error('Error fetching farmers:', error);
      }
    };
    fetchFarmers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/escrows', formData);
      setSuccess(true);
      setFormData({
        farmer_id: '',
        amount: '',
        practice_type: '',
        deadline_days: '30'
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create escrow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create New Escrow</h1>
      <div className="card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Escrow created successfully!</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="farmer_id">Select Farmer:</label>
            <select
              id="farmer_id"
              name="farmer_id"
              value={formData.farmer_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a farmer</option>
              {farmers.map(farmer => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.name} ({farmer.location})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (XRP):</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="practice_type">Practice Type:</label>
            <select
              id="practice_type"
              name="practice_type"
              value={formData.practice_type}
              onChange={handleChange}
              required
            >
              <option value="">Select a practice</option>
              <option value="drought_resistant">Drought Resistant Crops</option>
              <option value="water_saving">Water Saving Irrigation</option>
              <option value="soil_conservation">Soil Conservation</option>
              <option value="agroforestry">Agroforestry</option>
              <option value="organic_farming">Organic Farming</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="deadline_days">Deadline (days):</label>
            <input
              type="number"
              id="deadline_days"
              name="deadline_days"
              value={formData.deadline_days}
              onChange={handleChange}
              min="1"
              max="365"
              required
            />
          </div>

          <button 
            type="submit" 
            className="button"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Escrow'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEscrow; 