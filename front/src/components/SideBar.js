import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <h1 className="logo-link">
        <NavLink to="/" className="logo-link" end>
          Proof Fund
        </NavLink>
      </h1>
      <ul className="nav-list">
        <li>
          <NavLink to="/farmers" activeClassName="active">
            Farmers
          </NavLink>
        </li>
        <li>
          <NavLink to="/escrows" activeClassName="active">
            Escrows
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" activeClassName="active">
            Settings
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
