import React, { useState, useEffect } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { api } from "../services/api";

export default function XRPLConnector() {
  const [status, setStatus] = useState({
    connected: false,
    balance: "0",
  });

  useEffect(() => {
    api
      .get("/xrpl/status")
      .then((r) => setStatus(r.data))
      .catch(() => {});
  }, []);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Chip
        label={status.connected ? "XRPL ✓" : "XRPL ✕"}
        color={status.connected ? "success" : "default"}
        size="small"
      />
      {status.connected && (
        <Typography variant="body2">Balance: {status.balance} XRP</Typography>
      )}
    </Box>
  );
}
