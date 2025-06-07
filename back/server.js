// back/server.js
import express from "express";
import cors from "cors";
import knex from "knex";
import xrpl from "xrpl";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// XRPL Client Configuration
const TESTNET_URL = "wss://s.altnet.rippletest.net:51233";
let client;

// Initialize XRPL Client
async function initializeXRPL() {
  try {
    client = new xrpl.Client(TESTNET_URL);
    await client.connect();
    console.log("Connected to XRPL Testnet");
  } catch (error) {
    console.error("Failed to connect to XRPL:", error);
  }
}

// Helper function to generate escrow conditions
function generateEscrowCondition(farmerId, practiceType) {
  const data = `${farmerId}-${practiceType}-${Date.now()}`;
  return {
    condition: crypto.createHash("sha256").update(data).digest("hex"),
    fulfillment: data,
  };
}

// Routes

// Get all farmers
app.get("/api/farmers", async (req, res) => {
  try {
    const farmers = await knex("farmers").select("*");
    res.json(farmers);
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
});

// Register new farmer
app.post("/api/farmers", async (req, res) => {
  try {
    const { name, location, xrp_address, farm_size, primary_crop } = req.body;

    const [farmerId] = await knex("farmers").insert({
      name,
      location,
      xrp_address,
      farm_size,
      primary_crop,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const farmer = await knex("farmers").where("id", farmerId).first();
    res.status(201).json(farmer);
  } catch (error) {
    console.error("Error creating farmer:", error);
    res.status(500).json({ error: "Failed to create farmer" });
  }
});

// Get all escrows
app.get("/api/escrows", async (req, res) => {
  try {
    const escrows = await knex("escrows")
      .join("farmers", "escrows.farmer_id", "farmers.id")
      .select(
        "escrows.*",
        "farmers.name as farmer_name",
        "farmers.location as farmer_location"
      );
    res.json(escrows);
  } catch (error) {
    console.error("Error fetching escrows:", error);
    res.status(500).json({ error: "Failed to fetch escrows" });
  }
});

// Create escrow
app.post("/api/escrows", async (req, res) => {
  try {
    const { farmer_id, amount, practice_type, deadline_days } = req.body;

    const farmer = await knex("farmers").where("id", farmer_id).first();
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    // Generate escrow condition
    const { condition, fulfillment } = generateEscrowCondition(
      farmer_id,
      practice_type
    );

    // Calculate deadline (in seconds since Ripple epoch)
    const rippleEpoch = 946684800; // Jan 1, 2000 00:00:00 UTC
    const deadlineTimestamp =
      Math.floor(Date.now() / 1000) +
      deadline_days * 24 * 60 * 60 -
      rippleEpoch;

    // Insert escrow record
    const [escrowId] = await knex("escrows").insert({
      farmer_id,
      amount: parseFloat(amount),
      practice_type,
      status: "pending",
      condition_hash: condition,
      fulfillment_data: fulfillment,
      deadline: new Date(Date.now() + deadline_days * 24 * 60 * 60 * 1000),
      created_at: new Date(),
      updated_at: new Date(),
    });

    const escrow = await knex("escrows").where("id", escrowId).first();
    res.status(201).json({
      ...escrow,
      xrpl_deadline: deadlineTimestamp,
      farmer_address: farmer.xrp_address,
    });
  } catch (error) {
    console.error("Error creating escrow:", error);
    res.status(500).json({ error: "Failed to create escrow" });
  }
});

// Verify practice and release escrow
app.post("/api/escrows/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_data, satellite_image_url } = req.body;

    const escrow = await knex("escrows").where("id", id).first();
    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found" });
    }

    if (escrow.status !== "pending") {
      return res.status(400).json({ error: "Escrow is not in pending status" });
    }

    // Update escrow status
    await knex("escrows").where("id", id).update({
      status: "verified",
      verification_data,
      satellite_image_url,
      verified_at: new Date(),
      updated_at: new Date(),
    });

    // Log verification
    await knex("verification_logs").insert({
      escrow_id: id,
      verification_type: "satellite",
      verification_data,
      verified_at: new Date(),
    });

    const updatedEscrow = await knex("escrows").where("id", id).first();
    res.json({
      message: "Practice verified successfully",
      escrow: updatedEscrow,
      fulfillment: escrow.fulfillment_data,
    });
  } catch (error) {
    console.error("Error verifying practice:", error);
    res.status(500).json({ error: "Failed to verify practice" });
  }
});

// Get verification logs
app.get("/api/verification-logs", async (req, res) => {
  try {
    const logs = await knex("verification_logs")
      .join("escrows", "verification_logs.escrow_id", "escrows.id")
      .join("farmers", "escrows.farmer_id", "farmers.id")
      .select(
        "verification_logs.*",
        "farmers.name as farmer_name",
        "escrows.practice_type",
        "escrows.amount"
      )
      .orderBy("verification_logs.verified_at", "desc");

    res.json(logs);
  } catch (error) {
    console.error("Error fetching verification logs:", error);
    res.status(500).json({ error: "Failed to fetch verification logs" });
  }
});

// Get dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const totalFarmers = await knex("farmers").count("* as count").first();
    const totalEscrows = await knex("escrows").count("* as count").first();
    const totalAmount = await knex("escrows").sum("amount as total").first();
    const verifiedEscrows = await knex("escrows")
      .where("status", "verified")
      .count("* as count")
      .first();

    const practiceStats = await knex("escrows")
      .select("practice_type")
      .count("* as count")
      .sum("amount as total_amount")
      .groupBy("practice_type");

    res.json({
      totalFarmers: totalFarmers.count,
      totalEscrows: totalEscrows.count,
      totalAmount: totalAmount.total || 0,
      verifiedEscrows: verifiedEscrows.count,
      practiceStats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Initialize database and start server
async function startServer() {
  try {
    // Run migrations
    await knex.migrate.latest();
    console.log("Database migrations completed");

    // Initialize XRPL connection
    await initializeXRPL();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  if (client && client.isConnected()) {
    await client.disconnect();
  }
  await knex.destroy();
  process.exit(0);
});

startServer();
