import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFarmers, createFarmer } from "../services/api";
import { countries, getCropsForCountry } from "../utils/countryCropData";
import '../components/FarmerList.css';

// Add Farmer Modal Component
function AddFarmerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    farm_size: '',
    primary_crop: '',
    xrp_address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableCrops, setAvailableCrops] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset primary_crop when location changes
      ...(name === 'location' && { primary_crop: '' })
    }));

    // Update available crops when location changes
    if (name === 'location') {
      setAvailableCrops(getCropsForCountry(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createFarmer(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create farmer');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Farmer</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
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
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="farm_size">Farm Size (hectares):</label>
            <input
              type="number"
              id="farm_size"
              name="farm_size"
              value={formData.farm_size}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="primary_crop">Primary Crop:</label>
            <select
              id="primary_crop"
              name="primary_crop"
              value={formData.primary_crop}
              onChange={handleChange}
              required
              className="form-select"
              disabled={!formData.location}
            >
              <option value="">Select a crop</option>
              {availableCrops.map(crop => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="xrp_address">XRP Address:</label>
            <input
              type="text"
              id="xrp_address"
              name="xrp_address"
              value={formData.xrp_address}
              onChange={handleChange}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Adding...' : 'Add Farmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await getFarmers();
      setFarmers(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching farmers:", err);
      setError("Failed to load farmers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarmerSuccess = () => {
    fetchFarmers(); // Refresh the list after adding a new farmer
  };

  if (loading) return <div className="loading">Loading farmers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="farmers-page">
      <div className="farmers-header">
        <h1>Farmers</h1>
        <button 
          className="add-farmer-btn" 
          onClick={() => setIsAddModalOpen(true)}
          style={{ display: 'inline-block' }}
        >
          Add New Farmer
        </button>
      </div>

      <AddFarmerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddFarmerSuccess}
      />

      <div className="farmers-grid">
        {farmers.map((farmer) => (
          <Link 
            to={`/farmers/${farmer.id}`} 
            key={farmer.id} 
            className="farmer-card"
            onClick={() => {
              console.log('Farmer card clicked:', {
                id: farmer.id,
                name: farmer.name,
                url: `/farmers/${farmer.id}`
              });
            }}
          >
            <h3>{farmer.name}</h3>
            <p className="farmer-location">{farmer.location}</p>
            <div className="farmer-details">
              <span>Farm Size: {farmer.farm_size ? `${farmer.farm_size} hectares` : 'Not specified'}</span>
              <span>Primary Crop: {farmer.primary_crop || 'Not specified'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 