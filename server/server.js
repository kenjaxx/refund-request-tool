const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// List all refund requests, optionally filtered by status
app.get('/api/refunds', (req, res) => {
  const { status } = req.query;

  if (status && !db.VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status filter. Must be one of: ${db.VALID_STATUSES.join(', ')}`,
    });
  }

  res.json(db.getAll({ status }));
});

// Create a new refund request
app.post('/api/refunds', (req, res) => {
  const { customerName, customerEmail, amount, reason } = req.body;

  const errors = [];
  if (!customerName || !customerName.trim()) errors.push('customerName is required');
  if (!customerEmail || !customerEmail.trim()) {
    errors.push('customerEmail is required');
  } else if (!isValidEmail(customerEmail)) {
    errors.push('customerEmail must be a valid email address');
  }
  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required');
  } else if (isNaN(amount) || Number(amount) <= 0) {
    errors.push('amount must be a positive number');
  }
  if (!reason || !reason.trim()) errors.push('reason is required');

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  const newRefund = db.create({
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    amount: Number(amount),
    reason: reason.trim(),
  });

  res.status(201).json(newRefund);
});

// Update the status of a refund request
app.patch('/api/refunds/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !db.VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status is required and must be one of: ${db.VALID_STATUSES.join(', ')}`,
    });
  }

  const existing = db.getById(id);
  if (!existing) {
    return res.status(404).json({ error: `No refund request found with id ${id}` });
  }

  res.json(db.updateStatus(id, status));
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Refund request tool running at http://localhost:${PORT}`);
});