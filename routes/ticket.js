const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

// POST /api/tickets - book a ticket using stored procedure
router.post('/', auth, async (req, res) => {
  const {
    concertId,
    price,
    seatNo,
    buyerFirstName,
    buyerLastName,
    buyerEmail,
    buyerPhone,
    paymentMethod
  } = req.body;

  if (!concertId || !price || !seatNo || !buyerFirstName || !buyerLastName || !buyerEmail || !buyerPhone || !paymentMethod) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await pool.query(
      `CALL book_ticket($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [concertId, buyerFirstName, buyerLastName, buyerEmail, buyerPhone, price, seatNo, paymentMethod, null, null]
    );
    const ticketIdResult = await pool.query('SELECT currval(pg_get_serial_sequence(\'ticket\',\'ticket_id\')) AS ticket_id');
    const ticket_id = ticketIdResult.rows[0].ticket_id;
    res.status(201).json({ ticket_id, status: 'Success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to book ticket', details: err.message });
  }
});

// DELETE /api/tickets/:id - cancel a ticket using stored procedure
router.delete('/:id', auth, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  if (!ticketId) {
    return res.status(400).json({ error: 'Ticket ID is required' });
  }
  try {
    await pool.query(`CALL cancel_ticket($1, $2)`, [ticketId, null]);
    res.json({ status: 'Ticket cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel ticket', details: err.message });
  }
});

// GET /api/tickets/me - get tickets for logged-in user
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
