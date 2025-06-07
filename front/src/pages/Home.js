import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
