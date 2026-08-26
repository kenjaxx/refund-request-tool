const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, 'data', 'refunds.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

function readAll() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeAll(refunds) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(refunds, null, 2));
}

const VALID_STATUSES = ['Pending', 'Approved', 'Rejected', 'Refunded', 'Cancelled'];

function getAll({ status } = {}) {
  const all = readAll();
  if (status) {
    return all.filter((r) => r.status.toLowerCase() === status.toLowerCase());
  }
  return all;
}

function getById(id) {
  return readAll().find((r) => r.id === id) || null;
}

function create({ customerName, customerEmail, amount, reason }) {
  const refunds = readAll();
  const now = new Date().toISOString();

  const newRefund = {
    id: crypto.randomUUID(),
    customerName,
    customerEmail,
    amount,
    reason,
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
  };

  refunds.push(newRefund);
  writeAll(refunds);
  return newRefund;
}

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