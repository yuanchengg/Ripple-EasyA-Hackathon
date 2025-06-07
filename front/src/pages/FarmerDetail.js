// front/src/pages/FarmerDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function FarmerDetail() {
  const { id } = useParams(); // grab “123” from /farmers/123
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/farmers/${id}`)
      .then((res) => setFarmer(res.data))
      .catch(() => setError("Could not load farmer"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading farmer…</p>;
  if (error) return <p>{error}</p>;
  if (!farmer) return <p>Farmer not found.</p>;

  return (
    <div className="farmer-detail">
      <h2>{farmer.name}</h2>
      <p>
        <strong>ID:</strong> {farmer.id}
      </p>
      <p>
        <strong>Location:</strong> {farmer.location}
      </p>
      <p>
        <strong>Joined:</strong> {farmer.joinDate}
      </p>
      {/* …any other fields you have… */}
      <Link to="/farmers">← Back to farmers</Link>
    </div>
  );
}
