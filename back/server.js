// back/server.js
import express from "express";
import cors from "cors";
import knex from "knex";
import xrpl from "xrpl";
import crypto from "crypto";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import knexConfig from './knexfile.js';
import dotenv from 'dotenv';
import cc from 'five-bells-condition';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Configuration
const db = knex(knexConfig.development);

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
    const farmers = await db("farmers").select("*");
    res.json(farmers);
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
});

// Get single farmer by ID
app.get("/api/farmers/:id", async (req, res) => {
  try {
    console.log('Backend: Fetching farmer with ID:', req.params.id);
    const farmer = await db("farmers").where("id", req.params.id).first();
    console.log('Backend: Farmer query result:', farmer);
    
    if (!farmer) {
      console.log('Backend: Farmer not found');
      return res.status(404).json({ error: "Farmer not found" });
    }
    
    console.log('Backend: Sending farmer response');
    res.json(farmer);
  } catch (error) {
    console.error("Backend: Error fetching farmer:", error);
    res.status(500).json({ error: "Failed to fetch farmer" });
  }
});

// Get farmer's escrows
app.get("/api/farmers/:id/escrows", async (req, res) => {
  try {
    console.log('Backend: Fetching escrows for farmer ID:', req.params.id);
    const escrows = await db("escrows")
      .where("farmer_id", req.params.id)
      .select("*");
    console.log('Backend: Escrows query result:', escrows);
    
    console.log('Backend: Sending escrows response');
    res.json(escrows);
  } catch (error) {
    console.error("Backend: Error fetching farmer escrows:", error);
    res.status(500).json({ error: "Failed to fetch farmer escrows" });
  }
});

// Register new farmer
app.post("/api/farmers", async (req, res) => {
  try {
    const { name, location, xrp_address, farm_size, primary_crop } = req.body;

    const [farmerId] = await db("farmers").insert({
      name,
      location,
      xrp_address,
      farm_size,
      primary_crop,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const farmer = await db("farmers").where("id", farmerId).first();
    res.status(201).json(farmer);
  } catch (error) {
    console.error("Error creating farmer:", error);
    res.status(500).json({ error: "Failed to create farmer" });
  }
});

// Get all escrows
app.get("/api/escrows", async (req, res) => {
  try {
    const escrows = await db("escrows")
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

    const farmer = await db("farmers").where("id", farmer_id).first();
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    // Generate escrow condition
    // const { condition, fulfillment } = generateEscrowCondition(
    //   farmer_id,
    //   practice_type
    // );

    // Calculate deadline (in seconds since Ripple epoch)
    const rippleEpoch = 946684800; // Jan 1, 2000 00:00:00 UTC
    const deadlineTimestamp =
      Math.floor(Date.now() / 1000) +
      deadline_days * 24 * 60 * 60 -
      rippleEpoch;

    const preimageData = crypto.randomBytes(32);
    const fulfillment = new cc.PreimageSha256();
    fulfillment.setPreimage(preimageData);

    // Create XRPL EscrowCreate transaction
    const currentLedger = await client.getLedgerIndex()
    const es_condition = fulfillment.getConditionBinary().toString('hex').toUpperCase();
    const fulfillmentHex = fulfillment.serializeBinary().toString('hex').toUpperCase();

    // Set FinishAfter to 5 minutes from now
    const finishAfter = new Date();
    finishAfter.setMinutes(finishAfter.getMinutes() + 5);
    const RIPPLE_EPOCH_OFFSET = 946684800;
    const finishAfterRippleTime = Math.floor(finishAfter.getTime() / 1000) - RIPPLE_EPOCH_OFFSET;
    const escrowCreate = {
      TransactionType: "EscrowCreate",
      Account: process.env.NGO_WALLET_ADDRESS,
      Destination: farmer.xrp_address,
      Amount: xrpl.xrpToDrops(amount.toString()),
      CancelAfter: deadlineTimestamp,
      Condition: es_condition,
      FinishAfter: finishAfterRippleTime, // Allow 7 days for verification
      // Flags: 2147483648,
      // LastLedgerSequence: currentLedger + 40,
      
    };

    const ledger = await client.request({
      command: "ledger",
      ledger_index: "validated", // ensures we get a valid, complete ledger
    });
    const currentRippleTime = ledger.result.ledger.close_time;
    console.log("XRPL current time:", currentRippleTime);
    console.log("Your FinishAfterRippleTime:", finishAfterRippleTime);
    console.log("Delta (seconds):", finishAfterRippleTime - currentRippleTime);
    console.log("escrowCreate:", escrowCreate);

    // Submit and wait for validation
    const prepared = await client.autofill(escrowCreate);
    console.log('Prepared LastLedgerSequence:', prepared.LastLedgerSequence);
    console.log('Current ledger index:', await client.getLedgerIndex());
    const signed = xrpl.Wallet.fromSecret(process.env.NGO_WALLET_SECRET).sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      console.error("XRPL EscrowCreate failed:", result.result.meta.TransactionResult, result.result);
      throw new Error("Failed to create escrow on XRPL");
    }

    // Insert escrow record
    const [escrowId] = await db("escrows").insert({
      farmer_id,
      amount: parseFloat(amount),
      practice_type,
      status: "pending",
      condition_hash: es_condition,
      fulfillment_data: fulfillment,
      xrpl_sequence: result.result.tx_json.Sequence,
      deadline: new Date(Date.now() + deadline_days * 24 * 60 * 60 * 1000),
      created_at: new Date(),
      updated_at: new Date(),
    });

    const escrow = await db("escrows").where("id", escrowId).first();
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

    const escrow = await db("escrows").where("id", id).first();
    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found" });
    }

    if (escrow.status !== "pending") {
      return res.status(400).json({ error: "Escrow is not in pending status" });
    }

    // Create XRPL EscrowFinish transaction
    const escrowFinish = {
      TransactionType: "EscrowFinish",
      Account: process.env.NGO_WALLET_ADDRESS,
      Owner: process.env.NGO_WALLET_ADDRESS,
      OfferSequence: escrow.xrpl_sequence,
      Condition: escrow.condition_hash,
      Fulfillment: escrow.fulfillment_data,
    };

    // Submit and wait for validation
    const prepared = await client.autofill(escrowFinish);
    const signed = xrpl.Wallet.fromSecret(process.env.NGO_WALLET_SECRET).sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error("Failed to finish escrow on XRPL");
    }

    // Update escrow status
    await db("escrows").where("id", id).update({
      status: "released",
      verification_data,
      satellite_image_url,
      verified_at: new Date(),
      released_at: new Date(),
      updated_at: new Date(),
    });

    // Log verification
    await db("verification_logs").insert({
      escrow_id: id,
      verification_type: "satellite",
      verification_data,
      verified_at: new Date(),
    });

    const updatedEscrow = await db("escrows").where("id", id).first();
    res.json({
      message: "Practice verified and escrow released successfully",
      escrow: updatedEscrow,
    });
  } catch (error) {
    console.error("Error verifying practice:", error);
    res.status(500).json({ error: "Failed to verify practice" });
  }
});

// Get verification logs
app.get("/api/verification-logs", async (req, res) => {
  try {
    const logs = await db("verification_logs")
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
    const totalFarmers = await db("farmers").count("* as count").first();
    const totalEscrows = await db("escrows").count("* as count").first();
    const totalAmount = await db("escrows").sum("amount as total").first();
    const verifiedEscrows = await db("escrows")
      .where("status", "verified")
      .count("* as count")
      .first();

    const practiceStats = await db("escrows")
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
  await db.destroy();
  process.exit(0);
});

startServer();
