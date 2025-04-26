const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/payments - fetch all payments
router.get('/', async (req, res) => {
  console.log('GET /api/payments called');
  try {
    const { rows } = await pool.query('SELECT * FROM payment ORDER BY payment_id');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST /api/payments - add a new payment
router.post('/', async (req, res) => {
  console.log('POST /api/payments called with body:', req.body);
  const { payment_date, amount, payment_method } = req.body;
  if (!payment_date || !amount || !payment_method) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Generate new payment_id as max(payment_id) + 1 or 1 if none exists
    const result = await pool.query('SELECT COALESCE(MAX(payment_id), 0) + 1 AS new_id FROM payment');
    const newPaymentId = result.rows[0].new_id;

    await pool.query(
      'INSERT INTO payment (payment_id, payment_date, amount, payment_method) VALUES ($1, $2, $3, $4)',
      [newPaymentId, payment_date, amount, payment_method]
    );

    res.status(201).json({ payment_id: newPaymentId, status: 'Payment added successfully' });
  } catch (err) {
    console.error('Error adding payment:', err);
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

module.exports = router;
