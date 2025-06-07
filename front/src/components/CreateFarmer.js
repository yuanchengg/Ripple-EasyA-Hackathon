import React, { useState } from 'react';
import api from '../services/api';

function CreateFarmer() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    xrp_address: '',
    farm_size: '',
    primary_crop: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      await api.post('/farmers', formData);
      setSuccess(true);
      setFormData({
        name: '',
        location: '',
        xrp_address: '',
        farm_size: '',
        primary_crop: ''
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to register farmer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Register New Farmer</h1>
      <div className="card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Farmer registered successfully!</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="xrp_address">XRP Address:</label>
            <input
              type="text"
              id="xrp_address"
              name="xrp_address"
              value={formData.xrp_address}
              onChange={handleChange}
              required
              pattern="^r[1-9A-HJ-NP-Za-km-z]{25,34}$"
              title="Please enter a valid XRP address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="farm_size">Farm Size (hectares):</label>
            <input
              type="number"
              id="farm_size"
              name="farm_size"
              value={formData.farm_size}
              onChange={handleChange}
              min="0.1"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="primary_crop">Primary Crop:</label>
            <input
              type="text"
              id="primary_crop"
              name="primary_crop"
              value={formData.primary_crop}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Farmer'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateFarmer; 