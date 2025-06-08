import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFarmer, getFarmerEscrows, createEscrow } from "../services/api";
import "./FarmerDetail.css";

// Helper function to convert ISO time to Ripple time
const isoTimeToRippleTime = (isoTime) => {
  const date = new Date(isoTime);
  return Math.floor(date.getTime() / 1000) + 946684800; // Add Ripple epoch offset
};

const FarmerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [escrows, setEscrows] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [showModal, setShowModal] = useState(false);
  const [newEscrow, setNewEscrow] = useState({
    amount: "",
    description: "",
    practice_type: "",
    deadline_days: "30" // Default to 30 days
  });

  // Sustainable agriculture practices
  const practiceTypes = [
    "Crop Rotation",
    "Cover Cropping",
    "No-Till Farming",
    "Integrated Pest Management",
    "Agroforestry",
    "Water Conservation",
    "Soil Conservation",
    "Organic Farming",
    "Biodiversity Enhancement",
    "Sustainable Irrigation"
  ];

  // Mock wallet addresses - replace these with actual wallet integration
  const userWallet = {
    classicAddress: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" // Replace with actual user wallet
  };
  
  const orgWallet = {
    classicAddress: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" // Replace with actual org wallet
  };

  const handleCreateEscrowClick = () => {
    setShowModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [farmerResponse, escrowsResponse] = await Promise.all([
          getFarmer(id),
          getFarmerEscrows(id),
        ]);
        
        const farmerData = farmerResponse.data;
        const escrowsData = escrowsResponse.data;
        
        if (!farmerData) {
          throw new Error("Farmer not found");
        }
        
        const escrowsArray = Array.isArray(escrowsData) ? escrowsData : [];
        
        console.log('Farmer data:', farmerData);
        console.log('Escrows data:', escrowsArray);
        
        setFarmer(farmerData);
        setEscrows(escrowsArray);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load farmer details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEscrow(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateEscrow = async () => {
    try {
      if (!farmer.xrp_address) {
        throw new Error("Farmer's XRP address is not set");
      }

      console.log('Validating XRP address:', farmer.xrp_address);
      
      // More lenient validation - just check if it starts with 'r'
      if (!farmer.xrp_address.startsWith('r')) {
        console.error('Invalid XRP address format:', farmer.xrp_address);
        throw new Error("Invalid XRP address format");
      }

      // Convert amount to drops (1 XRP = 1,000,000 drops)
      const amountInDrops = (parseFloat(newEscrow.amount) * 1000000).toString();
      
      // Calculate deadline based on days
      const deadlineDate = new Date(Date.now() + (parseInt(newEscrow.deadline_days) * 24 * 60 * 60 * 1000));
      const cancelDate = new Date(deadlineDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after deadline
      
      const escrowCreateTx = {
        "TransactionType": "EscrowCreate",
        "Account": process.env.NGO_WALLET_ADDRESS, // Organization's wallet address from .env
        "Destination": farmer.xrp_address, // Farmer's XRP address as destination
        "Amount": amountInDrops,
        "FinishAfter": isoTimeToRippleTime(deadlineDate.toISOString()),
        "CancelAfter": isoTimeToRippleTime(cancelDate.toISOString()),
        "Flags": 0,
        "Condition": "A0258020E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855810100"
      };

      console.log('Creating escrow with transaction:', escrowCreateTx);

      // Create escrow in database
      const escrowData = {
        farmer_id: id,
        amount: newEscrow.amount,
        practice_type: newEscrow.practice_type,
        description: newEscrow.description,
        status: "active",
        created_at: new Date().toISOString(),
        deadline: deadlineDate.toISOString(),
        transaction_data: escrowCreateTx
      };

      console.log('Creating escrow with data:', escrowData);
      
      const response = await createEscrow(escrowData);
      console.log('Escrow created:', response.data);

      // Refresh the escrows list
      const escrowsResponse = await getFarmerEscrows(id);
      setEscrows(escrowsResponse.data);
      
      setShowModal(false);
      setNewEscrow({ amount: "", description: "", practice_type: "", deadline_days: "30" });
    } catch (error) {
      console.error('Error creating escrow:', error);
      let errorMessage = 'Failed to create escrow. ';
      if (error.message === "Farmer's XRP address is not set") {
        errorMessage += "Please ensure the farmer has a valid XRP address.";
      } else if (error.message === "Invalid XRP address format") {
        errorMessage += `The farmer's XRP address (${farmer.xrp_address}) is not in the correct format.`;
      } else if (error.message.includes("Missing field 'account'")) {
        errorMessage += "Invalid XRP address configuration.";
      } else {
        errorMessage += "Please try again.";
      }
      alert(errorMessage);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!farmer) {
    return <div className="error">Farmer not found</div>;
  }

  const activeEscrows = Array.isArray(escrows) ? escrows.filter(e => e.status === "active") : [];
  const completedEscrows = Array.isArray(escrows) ? escrows.filter(e => e.status === "completed") : [];
  const displayedEscrows = activeTab === "active" ? activeEscrows : completedEscrows;

  return (
    <div className="farmer-detail-page">
      <div className="farmer-detail-header">
        <button className="back-button" onClick={() => navigate("/farmers")}>
          ← Back to Farmers
        </button>
      </div>

      <div className="farmer-detail-content">
        <div className="farmer-info-section">
          <div className="info-card">
            <h2>{farmer.name}'s Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Location</label>
                <span>{farmer.location || "Not specified"}</span>
              </div>
              <div className="info-item">
                <label>Farm Size</label>
                <span>{farmer.farm_size ? `${farmer.farm_size} hectares` : "Not specified"}</span>
              </div>
              <div className="info-item">
                <label>Primary Crop</label>
                <span>{farmer.primary_crop || "Not specified"}</span>
              </div>
              <div className="info-item">
                <label>XRP Address</label>
                <span className="xrp-address">{farmer.xrp_address || "Not specified"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="escrows-section">
          <div className="escrows-header">
            <h2>Escrows</h2>
            <button className="create-escrow-btn" onClick={handleCreateEscrowClick}>
              Create Escrow
            </button>
          </div>
          <div className="escrow-tabs">
            <button 
              className={`escrow-tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active Escrows
            </button>
            <button 
              className={`escrow-tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed Escrows
            </button>
          </div>
          {displayedEscrows.length > 0 ? (
            <div className="escrows-list">
              {displayedEscrows.map((escrow) => (
                <div key={escrow.id} className="escrow-item">
                  <div className="escrow-header">
                    <span className="escrow-id">Escrow #{escrow.id}</span>
                    <span className={`escrow-status ${escrow.status}`}>
                      {escrow.status}
                    </span>
                  </div>
                  <div className="escrow-details">
                    <div className="escrow-info">
                      <span className="escrow-amount">{escrow.amount} XRP</span>
                      <span className="escrow-date">
                        {new Date(escrow.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="escrow-description">
                      {escrow.description || "No description provided"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-escrows">No {activeTab} escrows found for this farmer</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Escrow</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Amount (XRP)</label>
                <input
                  type="number"
                  name="amount"
                  value={newEscrow.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount in XRP"
                  min="0"
                  step="0.000001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Practice Type</label>
                <select
                  name="practice_type"
                  value={newEscrow.practice_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a practice type</option>
                  {practiceTypes.map((practice) => (
                    <option key={practice} value={practice}>
                      {practice}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Deadline (days)</label>
                <input
                  type="number"
                  name="deadline_days"
                  value={newEscrow.deadline_days}
                  onChange={handleInputChange}
                  placeholder="Enter number of days"
                  min="1"
                  max="365"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newEscrow.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-submit" onClick={handleCreateEscrow}>
                Create Escrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDetail; 