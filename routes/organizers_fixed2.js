// routes/organizers.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/organizers - list all organizers
router.get('/', async (req, res) => {
  try {
    const q = 'SELECT organizer_id, first_name, last_name, contact_info FROM organizer ORDER BY last_name, first_name';
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch organizers' });
  }
});

// GET /api/organizers/:id - get organizer details
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const q = 'SELECT organizer_id, first_name, last_name, contact_info FROM organizer WHERE organizer_id = $1';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Organizer not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch organizer' });
  }
});

// POST /api/organizers - add a new organizer
router.post('/', async (req, res) => {
  const { first_name, last_name, contact_info } = req.body;
  
  if (!first_name || !last_name || !contact_info) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Get the next organizer_id by finding the maximum existing ID and adding 1
    const maxIdQuery = 'SELECT MAX(organizer_id) FROM organizer';
    const maxIdResult = await pool.query(maxIdQuery);
    const nextId = (maxIdResult.rows[0].max || 0) + 1;
    
    // Insert the new organizer with the generated ID
    const q = 'INSERT INTO organizer (organizer_id, first_name, last_name, contact_info) VALUES ($1, $2, $3, $4) RETURNING organizer_id, first_name, last_name, contact_info';
    const { rows } = await pool.query(q, [nextId, first_name, last_name, contact_info]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    // Check if this is a unique constraint violation on contact_info
    if (err.code === '23505' && err.constraint === 'organizer_contact_info_key') {
      return res.status(400).json({ 
        error: 'Contact info already exists', 
        detail: 'An organizer with this contact info already exists in the database.' 
      });
    }
    // Handle other database errors
    res.status(500).json({ error: 'Failed to add organizer', detail: err.message });
  }
});

// PUT /api/organizers/:id - update organizer details
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { first_name, last_name, contact_info } = req.body;
  try {
    const q = 'UPDATE organizer SET first_name = $1, last_name = $2, contact_info = $3 WHERE organizer_id = $4 RETURNING organizer_id, first_name, last_name, contact_info';
    const { rows } = await pool.query(q, [first_name, last_name, contact_info, id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Organizer not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    // Check if this is a unique constraint violation on contact_info
    if (err.code === '23505' && err.constraint === 'organizer_contact_info_key') {
      return res.status(400).json({ 
        error: 'Contact info already exists', 
        detail: 'An organizer with this contact info already exists in the database.' 
      });
    }
    res.status(500).json({ error: 'Failed to update organizer' });
  }
});

// DELETE /api/organizers/:id - delete an organizer
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const q = 'DELETE FROM organizer WHERE organizer_id = $1 RETURNING organizer_id';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Organizer not found' });
    res.json({ message: 'Organizer deleted' });
  } catch (err) {
    console.error(err);
    // Check if this is a foreign key constraint violation
    if (err.code === '23503') {
      return res.status(400).json({ 
        error: 'Cannot delete organizer', 
        detail: 'This organizer is referenced by other records in the database.' 
      });
    }
    res.status(500).json({ error: 'Failed to delete organizer' });
  }
});

module.exports = router;