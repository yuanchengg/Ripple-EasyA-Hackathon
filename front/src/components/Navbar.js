import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Climate Aid Escrow</Link>
      </div>
      <div className="nav-links">
        <Link to="/farmers">Farmers</Link>
        <Link to="/farmers/new" className="nav-button">+ New Farmer</Link>
        <Link to="/escrows">Escrows</Link>
        <Link to="/escrows/new" className="nav-button">+ New Escrow</Link>
        <Link to="/verifications">Verifications</Link>
      </div>
    </nav>
  );
}

export default Navbar; 