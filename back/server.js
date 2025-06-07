// back/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import knex from "./config/database.js";
import xrpl from "xrpl";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// XRPL setup
const { XRPL_WALLET_ADDRESS, XRPL_WALLET_SECRET } = process.env;
const TESTNET_URL = "wss://s.altnet.rippletest.net:51233";
let client, wallet;

// Ripple epoch offset
const RIPPLE_EPOCH = 946684800;

async function initializeXRPL() {
  client = new xrpl.Client(TESTNET_URL);
  await client.connect();
  wallet = xrpl.Wallet.fromSeed(XRPL_WALLET_SECRET);
  console.log("Connected to XRPL Testnet as", wallet.address);
}

// ---- ROUTES ---- //

// 1) XRPL status & balance
app.get("/api/xrpl/status", async (req, res) => {
  try {
    const acct = await client.request({
      command: "account_info",
      account: XRPL_WALLET_ADDRESS,
      ledger_index: "validated",
    });
    const balance = xrpl.dropsToXrp(acct.result.account_data.Balance);
    res.json({ connected: client.isConnected(), balance });
  } catch (err) {
    res
      .status(500)
      .json({ connected: client.isConnected(), error: err.message });
  }
});

// 2) Create escrow + XRPL EscrowCreate
app.post("/api/escrows", async (req, res) => {
  try {
    const { farmer_id, amount, practice_type, deadline_days } = req.body;
    const farmer = await knex("farmers").where("id", farmer_id).first();
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });

    // condition & fulfillment
    const data = `${farmer_id}-${practice_type}-${Date.now()}`;
    const condition = xrpl
      .hashConditionSha256(Buffer.from(data))
      .toString("hex");
    const fulfillment = data;

    // compute CancelAfter (ripple epoch seconds)
    const cancelAfter =
      Math.floor(Date.now() / 1000) -
      RIPPLE_EPOCH +
      deadline_days * 24 * 60 * 60;

    // XRPL EscrowCreate tx
    const tx = {
      TransactionType: "EscrowCreate",
      Account: XRPL_WALLET_ADDRESS,
      Destination: farmer.xrp_address,
      Amount: xrpl.xrpToDrops(amount.toString()),
      Condition: condition,
      CancelAfter: cancelAfter,
    };
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    await client.submitAndWait(signed.tx_blob);
    const seq = signed.tx_json.Sequence;

    // insert DB record
    const [escrowId] = await knex("escrows").insert({
      farmer_id,
      amount,
      practice_type,
      status: "pending",
      condition_hash: condition,
      fulfillment_data: fulfillment,
      xrpl_sequence: seq,
      deadline: new Date(Date.now() + deadline_days * 24 * 60 * 60 * 1000),
      created_at: new Date(),
      updated_at: new Date(),
    });
    const escrow = await knex("escrows").where("id", escrowId).first();
    res.status(201).json(escrow);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 3) Verify & release escrow via EscrowFinish
app.post("/api/escrows/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_data, satellite_image_url } = req.body;
    const escrow = await knex("escrows").where("id", id).first();
    if (!escrow) return res.status(404).json({ error: "Escrow not found" });
    if (escrow.status !== "pending")
      return res.status(400).json({ error: "Not pending" });

    // XRPL EscrowFinish
    const finishTx = {
      TransactionType: "EscrowFinish",
      Account: XRPL_WALLET_ADDRESS,
      Owner: XRPL_WALLET_ADDRESS,
      OfferSequence: parseInt(escrow.xrpl_sequence, 10),
      Fulfillment: escrow.fulfillment_data,
    };
    const prepared = await client.autofill(finishTx);
    const signed = wallet.sign(prepared);
    await client.submitAndWait(signed.tx_blob);

    // update DB
    await knex("escrows").where("id", id).update({
      status: "released",
      verification_data,
      satellite_image_url,
      verified_at: new Date(),
      released_at: new Date(),
      updated_at: new Date(),
    });
    // log verification
    await knex("verification_logs").insert({
      escrow_id: id,
      verification_type: "satellite",
      verification_data,
      verified_at: new Date(),
    });

    const updated = await knex("escrows").where("id", id).first();
    res.json({ message: "Released", escrow: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 4) Cancel escrow via EscrowCancel when deadline reached
app.post("/api/escrows/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await knex("escrows").where("id", id).first();
    if (!escrow) return res.status(404).json({ error: "Escrow not found" });
    if (escrow.status !== "pending")
      return res.status(400).json({ error: "Not pending" });
    if (new Date(escrow.deadline) > new Date())
      return res.status(400).json({ error: "Deadline not reached" });

    // XRPL EscrowCancel
    const cancelTx = {
      TransactionType: "EscrowCancel",
      Account: XRPL_WALLET_ADDRESS,
      Owner: XRPL_WALLET_ADDRESS,
      OfferSequence: parseInt(escrow.xrpl_sequence, 10),
    };
    const prepared = await client.autofill(cancelTx);
    const signed = wallet.sign(prepared);
    await client.submitAndWait(signed.tx_blob);

    // update DB
    await knex("escrows").where("id", id).update({
      status: "expired",
      updated_at: new Date(),
    });

    res.json({ message: "Expired & canceled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 5) Fetch escrows (with farmer join)
app.get("/api/escrows", async (req, res) => {
  const escrows = await knex("escrows")
    .join("farmers", "escrows.farmer_id", "farmers.id")
    .select(
      "escrows.*",
      "farmers.name as farmer_name",
      "farmers.location as farmer_location"
    );
  res.json(escrows);
});

// ... (you can keep the other routes: /api/farmers, /api/verification-logs, /api/dashboard/stats, /health)

async function start() {
  await knex.migrate.latest();
  await initializeXRPL();
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}
start();
