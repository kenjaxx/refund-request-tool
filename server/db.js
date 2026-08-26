
// This file handles reading and writing refund requests to a JSON file.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, 'data', 'refunds.json');

// Make sure the data file exists before we try to read it
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

// Read all refund requests from the file
function readAll() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Save the full list of refund requests back to the file
function writeAll(refunds) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(refunds, null, 2));
}

const VALID_STATUSES = ['Pending', 'Approved', 'Rejected', 'Refunded', 'Cancelled'];

// Get all refund requests, optionally filtered by status
function getAll({ status } = {}) {
  const all = readAll();
  if (status) {
    return all.filter((r) => r.status.toLowerCase() === status.toLowerCase());
  }
  return all;
}

// Find one refund request by its id
function getById(id) {
  return readAll().find((r) => r.id === id) || null;
}

// Create a new refund request
function create({ customerName, customerEmail, amount, reason }) {
  const refunds = readAll();
  const now = new Date().toISOString();

  const newRefund = {
    id: crypto.randomUUID(),
    customerName,
    customerEmail,
    amount,
    reason,
    status: 'Pending', // every new request starts as Pending
    createdAt: now,
    updatedAt: now,
  };

  refunds.push(newRefund);
  writeAll(refunds);
  return newRefund;
}

// Update just the status of a refund request
function updateStatus(id, status) {
  const refunds = readAll();
  const index = refunds.findIndex((r) => r.id === id);
  if (index === -1) return null;

  refunds[index].status = status;
  refunds[index].updatedAt = new Date().toISOString();
  writeAll(refunds);
  return refunds[index];
}

module.exports = {
  VALID_STATUSES,
  getAll,
  getById,
  create,
  updateStatus,
};