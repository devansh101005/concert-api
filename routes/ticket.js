// routes/tickets.js
const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

// POST /api/tickets
router.post('/', auth, async (req, res) => {
  const { concertId, price, seatNo, paymentMethod } = req.body;
  const buyerId = req.user.buyerId;
  const client  = await pool.connect();

  try {
    await client.query('BEGIN');
    const payQ = `
      INSERT INTO payment (payment_date, amount, payment_method)
      VALUES (NOW(), $1, $2) RETURNING payment_id;
    `;
    const payR = await client.query(payQ, [price, paymentMethod]);

    const tikQ = `
      INSERT INTO ticket (price, seat_no, concert_id, buyer_id, payment_id)
      VALUES ($1,$2,$3,$4,$5) RETURNING ticket_id;
    `;
    const tikR = await client.query(tikQ, [price, seatNo, concertId, buyerId, payR.rows[0].payment_id]);

    await client.query('COMMIT');
    res.status(201).json({ ticket: tikR.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Booking failed' });
  } finally {
    client.release();
  }
});

// GET /api/tickets/me
router.get('/me', auth, async (req, res) => {
  try {
    const q = `
      SELECT t.ticket_id, t.price, t.seat_no,
             c.concert_id, c.name, c.date
      FROM ticket t
      JOIN concert c ON t.concert_id = c.concert_id
      WHERE t.buyer_id = $1;
    `;
    const { rows } = await pool.query(q, [req.user.buyerId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot fetch tickets' });
  }
});

module.exports = router;
