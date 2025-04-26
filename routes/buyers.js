// routes/buyers.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/buyers - list all buyers
router.get('/', async (req, res) => {
  try {
    const q = 'SELECT buyer_id, first_name, last_name, email_id, phone_no FROM buyer ORDER BY last_name, first_name';
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

// GET /api/buyers/:id - get buyer details
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const q = 'SELECT buyer_id, first_name, last_name, email_id, phone_no FROM buyer WHERE buyer_id = $1';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Buyer not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch buyer' });
  }
});

// POST /api/buyers - add a new buyer
router.post('/', async (req, res) => {
  const { first_name, last_name, email_id, phone_no, password } = req.body;
  
  // Validate required fields
  if (!first_name || !last_name || !email_id || !phone_no || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Check if email already exists
    const emailCheck = 'SELECT 1 FROM buyer WHERE email_id = $1';
    const emailResult = await pool.query(emailCheck, [email_id]);
    
    if (emailResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email already in use', 
        detail: 'Please use a different email address.' 
      });
    }
    
    // Insert new buyer (payment_id can be null initially)
    const q = 'INSERT INTO buyer (first_name, last_name, email_id, phone_no, password) VALUES ($1, $2, $3, $4, $5) RETURNING buyer_id, first_name, last_name, email_id, phone_no';
    const { rows } = await pool.query(q, [first_name, last_name, email_id, phone_no, password]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add buyer' });
  }
});

// PUT /api/buyers/:id - update buyer details
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { first_name, last_name, email_id, phone_no, password } = req.body;
  
  // Validate required fields
  if (!first_name || !last_name || !email_id || !phone_no) {
    return res.status(400).json({ error: 'First name, last name, email, and phone are required' });
  }
  
  try {
    // Check if email already exists for another buyer
    const emailCheck = 'SELECT 1 FROM buyer WHERE email_id = $1 AND buyer_id != $2';
    const emailResult = await pool.query(emailCheck, [email_id, id]);
    
    if (emailResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email already in use', 
        detail: 'Please use a different email address.' 
      });
    }
    
    // Update the buyer
    let q, params, result;
    
    if (password) {
      // If password is provided, update it too
      q = 'UPDATE buyer SET first_name = $1, last_name = $2, email_id = $3, phone_no = $4, password = $5 WHERE buyer_id = $6 RETURNING buyer_id, first_name, last_name, email_id, phone_no';
      params = [first_name, last_name, email_id, phone_no, password, id];
    } else {
      // If no password provided, don't update it
      q = 'UPDATE buyer SET first_name = $1, last_name = $2, email_id = $3, phone_no = $4 WHERE buyer_id = $5 RETURNING buyer_id, first_name, last_name, email_id, phone_no';
      params = [first_name, last_name, email_id, phone_no, id];
    }
    
    const { rows } = await pool.query(q, params);
    if (rows.length === 0) return res.status(404).json({ error: 'Buyer not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update buyer' });
  }
});

// DELETE /api/buyers/:id - delete a buyer
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // Check if buyer has associated tickets
    const ticketCheck = 'SELECT 1 FROM ticket WHERE buyer_id = $1';
    const ticketResult = await pool.query(ticketCheck, [id]);
    
    if (ticketResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete buyer', 
        detail: 'This buyer has purchased tickets. Please delete the tickets first.' 
      });
    }
    
    const q = 'DELETE FROM buyer WHERE buyer_id = $1 RETURNING buyer_id';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Buyer not found' });
    res.json({ message: 'Buyer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete buyer' });
  }
});

module.exports = router;