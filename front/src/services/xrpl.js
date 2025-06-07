import { Client, Wallet } from 'xrpl';

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

export const disconnectXRPL = async () => {
  if (client) {
    await client.disconnect();
    console.log("Disconnected from XRPL");
  }
};

export const getAccountInfo = async (address) => {
  try {
    const response = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });
    return response.result.account_data;
  } catch (error) {
    console.error("Error fetching account info:", error);
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

export const getCurrentLedgerIndex = async () => {
  try {
    const response = await client.request({
      command: "ledger",
      ledger_index: "validated",
    });
    return response.result.ledger_index;
  } catch (error) {
    console.error("Error fetching current ledger index:", error);
    throw error;
  }
};

export const subscribeToEscrowEvents = async (address, callback) => {
  try {
    await client.request({
      command: "subscribe",
      accounts: [address],
    });

    client.on("transaction", (tx) => {
      if (tx.transaction.Account === address || tx.transaction.Destination === address) {
        callback(tx);
      }
    });
  } catch (error) {
    console.error("Error subscribing to escrow events:", error);
    throw error;
  }
};

export const unsubscribeFromEscrowEvents = async (address) => {
  try {
    await client.request({
      command: "unsubscribe",
      accounts: [address],
    });
  } catch (error) {
    console.error("Error unsubscribing from escrow events:", error);
    throw error;
  }
};
