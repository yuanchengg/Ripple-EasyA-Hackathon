// front/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FarmerList from './components/FarmerList';
import CreateFarmer from './components/CreateFarmer';
import EscrowList from './components/EscrowList';
import CreateEscrow from './components/CreateEscrow';
import VerificationList from './components/VerificationList';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/farmers" element={<FarmerList />} />
            <Route path="/farmers/new" element={<CreateFarmer />} />
            <Route path="/escrows" element={<EscrowList />} />
            <Route path="/escrows/new" element={<CreateEscrow />} />
            <Route path="/verifications" element={<VerificationList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;