// front/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FarmerList from "./components/FarmerList";
import FarmerDetail from "./pages/FarmerDetail";
import CreateFarmer from "./components/CreateFarmer";
import EscrowList from "./components/EscrowList";
import CreateEscrow from "./components/CreateEscrow";
import VerificationList from "./components/VerificationList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Dashboard />} />

          {/* list page */}
          <Route path="farmers" element={<FarmerList />} />

          {/* detail page - grabs :id from the URL */}
          <Route path="farmers/:id" element={<FarmerDetail />} />

          <Route path="farmers/new" element={<CreateFarmer />} />
          <Route path="escrows" element={<EscrowList />} />
          <Route path="escrows/new" element={<CreateEscrow />} />
          <Route path="verifications" element={<VerificationList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
