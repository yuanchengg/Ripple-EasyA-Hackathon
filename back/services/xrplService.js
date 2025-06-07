import { Client, Wallet } from 'xrpl';
import crypto from 'crypto';

const TESTNET_URL = "wss://s.altnet.rippletest.net:51233";
let client;

export const initializeXRPL = async () => {
  try {
    client = new Client(TESTNET_URL);
    await client.connect();
    console.log("Connected to XRPL Testnet");
    return true;
  } catch (error) {
    console.error("Failed to connect to XRPL:", error);
    return false;
  }
};

export const generateEscrowCondition = (farmerId, practiceType) => {
  const data = `${farmerId}-${practiceType}-${Date.now()}`;
  return {
    condition: crypto.createHash("sha256").update(data).digest("hex"),
    fulfillment: data,
  };
};

export const createEscrow = async (params) => {
  const {
    ngoWallet,
    farmerAddress,
    amount,
    condition,
    deadlineTimestamp,
  } = params;

  try {
    const escrowCreate = {
      TransactionType: "EscrowCreate",
      Account: ngoWallet.address,
      Destination: farmerAddress,
      Amount: amount,
      CancelAfter: deadlineTimestamp,
      Condition: condition,
      FinishAfter: deadlineTimestamp - (7 * 24 * 60 * 60), // Allow 7 days for verification
    };

    const prepared = await client.autofill(escrowCreate);
    const signed = ngoWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error("Failed to create escrow on XRPL");
    }

    return result.result;
  } catch (error) {
    console.error("Error creating escrow:", error);
    throw error;
  }
};

export const finishEscrow = async (params) => {
  const {
    ngoWallet,
    escrowSequence,
    condition,
    fulfillment,
  } = params;

  try {
    const escrowFinish = {
      TransactionType: "EscrowFinish",
      Account: ngoWallet.address,
      Owner: ngoWallet.address,
      OfferSequence: escrowSequence,
      Condition: condition,
      Fulfillment: fulfillment,
    };

    const prepared = await client.autofill(escrowFinish);
    const signed = ngoWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error("Failed to finish escrow on XRPL");
    }

    return result.result;
  } catch (error) {
    console.error("Error finishing escrow:", error);
    throw error;
  }
};

export const cancelEscrow = async (params) => {
  const {
    ngoWallet,
    escrowSequence,
  } = params;

  try {
    const escrowCancel = {
      TransactionType: "EscrowCancel",
      Account: ngoWallet.address,
      Owner: ngoWallet.address,
      OfferSequence: escrowSequence,
    };

    const prepared = await client.autofill(escrowCancel);
    const signed = ngoWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error("Failed to cancel escrow on XRPL");
    }

    return result.result;
  } catch (error) {
    console.error("Error cancelling escrow:", error);
    throw error;
  }
};

export const getEscrowInfo = async (address) => {
  try {
    const response = await client.request({
      command: "account_objects",
      account: address,
      type: "escrow",
    });
    return response.result.account_objects;
  } catch (error) {
    console.error("Error fetching escrow info:", error);
    throw error;
  }
};

export const getTransactionInfo = async (txHash) => {
  try {
    const response = await client.request({
      command: "tx",
      transaction: txHash,
    });
    return response.result;
  } catch (error) {
    console.error("Error fetching transaction info:", error);
    throw error;
  }
};

export const formatXRP = (drops) => {
  return Number(drops) / 1000000;
};

export const formatDrops = (xrp) => {
  return (Number(xrp) * 1000000).toString();
};
