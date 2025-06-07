import express from 'express';
import xrpl from 'xrpl';
import crypto from 'crypto';
import knex from '../config/database.js';

const router = express.Router();

// Initialize XRPL Client
const TESTNET_URL = "wss://s.altnet.rippletest.net:51233";
let client;

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

// Get all escrows
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
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

    // Create XRPL EscrowCreate transaction
    const escrowCreate = {
      TransactionType: "EscrowCreate",
      Account: process.env.NGO_WALLET_ADDRESS,
      Destination: farmer.xrp_address,
      Amount: xrpl.xrpToDrops(amount.toString()),
      CancelAfter: deadlineTimestamp,
      Condition: condition,
      FinishAfter: deadlineTimestamp - (7 * 24 * 60 * 60), // Allow 7 days for verification
    };

    // Submit and wait for validation
    const prepared = await client.autofill(escrowCreate);
    const signed = xrpl.Wallet.fromSecret(process.env.NGO_WALLET_SECRET).sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error("Failed to create escrow on XRPL");
    }

    // Insert escrow record
    const [escrowId] = await knex("escrows").insert({
      farmer_id,
      amount: parseFloat(amount),
      practice_type,
      status: "pending",
      condition_hash: condition,
      fulfillment_data: fulfillment,
      xrpl_sequence: result.result.tx_json.Sequence,
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
router.post('/:id/verify', async (req, res) => {
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
    await knex("escrows").where("id", id).update({
      status: "released",
      verification_data,
      satellite_image_url,
      verified_at: new Date(),
      released_at: new Date(),
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
      message: "Practice verified and escrow released successfully",
      escrow: updatedEscrow,
    });
  } catch (error) {
    console.error("Error verifying practice:", error);
    res.status(500).json({ error: "Failed to verify practice" });
  }
});

// Cancel escrow
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const escrow = await knex("escrows").where("id", id).first();
    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found" });
    }

    if (escrow.status !== "pending") {
      return res.status(400).json({ error: "Escrow is not in pending status" });
    }

    // Create XRPL EscrowCancel transaction
    const escrowCancel = {
      TransactionType: "EscrowCancel",
      Account: process.env.NGO_WALLET_ADDRESS,
      Owner: process.env.NGO_WALLET_ADDRESS,
      OfferSequence: escrow.xrpl_sequence,
    };

    // Submit and wait for validation
    const prepared = await client.autofill(escrowCancel);
    const signed = xrpl.Wallet.fromSecret(process.env.NGO_WALLET_SECRET).sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error("Failed to cancel escrow on XRPL");
    }

    // Update escrow status
    await knex("escrows").where("id", id).update({
      status: "expired",
      updated_at: new Date(),
    });

    const updatedEscrow = await knex("escrows").where("id", id).first();
    res.json({
      message: "Escrow cancelled successfully",
      escrow: updatedEscrow,
    });
  } catch (error) {
    console.error("Error cancelling escrow:", error);
    res.status(500).json({ error: "Failed to cancel escrow" });
  }
});

// Initialize XRPL connection when the router is created
initializeXRPL();

export default router;
