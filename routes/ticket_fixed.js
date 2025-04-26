const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

// GET /api/tickets - get all tickets
router.get('/', async (req, res) => {
  try {
    const q = `
      SELECT t.ticket_id, t.price, t.seat_no, t.buyer_id,
             b.first_name, b.last_name, b.email_id, b.phone_no,
             c.concert_id, c.name as concert_name, c.date
      FROM ticket t
      JOIN concert c ON t.concert_id = c.concert_id
      JOIN buyer b ON t.buyer_id = b.buyer_id
      ORDER BY t.ticket_id;
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot fetch tickets' });
  }
});

// GET /api/tickets/concert/:id - get tickets for a specific concert
router.get('/concert/:id', async (req, res) => {
  const concertId = parseInt(req.params.id);
  if (!concertId) {
    return res.status(400).json({ error: 'Concert ID is required' });
  }
  try {
    const q = `
      SELECT t.ticket_id, t.price, t.seat_no, t.buyer_id,
             b.first_name, b.last_name, b.email_id, b.phone_no,
             c.concert_id, c.name as concert_name, c.date
      FROM ticket t
      JOIN concert c ON t.concert_id = c.concert_id
      JOIN buyer b ON t.buyer_id = b.buyer_id
      WHERE t.concert_id = $1
      ORDER BY t.ticket_id;
    `;
    const { rows } = await pool.query(q, [concertId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot fetch tickets for this concert' });
  }
});

// POST /api/tickets - book a ticket
router.post('/', async (req, res) => {
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
    // First check if the concert exists
    const concertCheck = 'SELECT 1 FROM concert WHERE concert_id = $1';
    const concertResult = await pool.query(concertCheck, [concertId]);
    
    if (concertResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid concert ID', 
        detail: `Concert with ID ${concertId} does not exist.` 
      });
    }

    // Check if buyer exists or create a new one
    let buyerId;
    const buyerCheck = 'SELECT buyer_id FROM buyer WHERE email_id = $1';
    const buyerResult = await pool.query(buyerCheck, [buyerEmail]);
    
    if (buyerResult.rows.length > 0) {
      buyerId = buyerResult.rows[0].buyer_id;
    } else {
      // Create a new buyer
      const maxBuyerIdQuery = 'SELECT MAX(buyer_id) FROM buyer';
      const maxBuyerIdResult = await pool.query(maxBuyerIdQuery);
      const nextBuyerId = (maxBuyerIdResult.rows[0].max || 0) + 1;
      
      const insertBuyerQuery = `
        INSERT INTO buyer (buyer_id, first_name, last_name, email_id, phone_no)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING buyer_id
      `;
      const insertBuyerResult = await pool.query(
        insertBuyerQuery, 
        [nextBuyerId, buyerFirstName, buyerLastName, buyerEmail, buyerPhone]
      );
      buyerId = insertBuyerResult.rows[0].buyer_id;
    }

    // Create a new ticket
    const maxTicketIdQuery = 'SELECT MAX(ticket_id) FROM ticket';
    const maxTicketIdResult = await pool.query(maxTicketIdQuery);
    const nextTicketId = (maxTicketIdResult.rows[0].max || 0) + 1;
    
    const insertTicketQuery = `
      INSERT INTO ticket (ticket_id, concert_id, buyer_id, price, seat_no)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ticket_id
    `;
    const insertTicketResult = await pool.query(
      insertTicketQuery, 
      [nextTicketId, concertId, buyerId, price, seatNo]
    );
    const ticketId = insertTicketResult.rows[0].ticket_id;

    // Create a payment record
    const maxPaymentIdQuery = 'SELECT MAX(payment_id) FROM payment';
    const maxPaymentIdResult = await pool.query(maxPaymentIdQuery);
    const nextPaymentId = (maxPaymentIdResult.rows[0].max || 0) + 1;
    
    const insertPaymentQuery = `
      INSERT INTO payment (payment_id, ticket_id, payment_method, payment_date)
      VALUES ($1, $2, $3, CURRENT_DATE)
    `;
    await pool.query(
      insertPaymentQuery, 
      [nextPaymentId, ticketId, paymentMethod]
    );

    res.status(201).json({ 
      ticket_id: ticketId, 
      status: 'Success',
      message: 'Ticket booked successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to book ticket', details: err.message });
  }
});

// DELETE /api/tickets/:id - cancel a ticket
router.delete('/:id', async (req, res) => {
  const ticketId = parseInt(req.params.id);
  if (!ticketId) {
    return res.status(400).json({ error: 'Ticket ID is required' });
  }
  try {
    // Check if ticket exists
    const ticketCheck = 'SELECT 1 FROM ticket WHERE ticket_id = $1';
    const ticketResult = await pool.query(ticketCheck, [ticketId]);
    
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Ticket not found', 
        detail: `Ticket with ID ${ticketId} does not exist.` 
      });
    }

    // Delete the ticket
    const deleteTicketQuery = 'DELETE FROM ticket WHERE ticket_id = $1';
    await pool.query(deleteTicketQuery, [ticketId]);

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