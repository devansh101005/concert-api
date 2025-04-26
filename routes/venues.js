// routes/venues.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/venues - list all venues
router.get('/', async (req, res) => {
  try {
    const q = 'SELECT venue_id, name, street, city, pin_code, capacity FROM venue ORDER BY name';
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

// GET /api/venues/:id - get venue details
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const q = 'SELECT venue_id, name, street, city, pin_code, capacity FROM venue WHERE venue_id = $1';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
});

// POST /api/venues - add a new venue
router.post('/', async (req, res) => {
  const { name, street, city, pin_code, capacity } = req.body;
  
  // Validate required fields
  if (!name || !capacity) {
    return res.status(400).json({ error: 'Name and capacity are required' });
  }
  
  try {
    // Check if pin_code already exists (if provided)
    if (pin_code) {
      const pinCodeCheck = 'SELECT 1 FROM venue WHERE pin_code = $1';
      const pinCodeResult = await pool.query(pinCodeCheck, [pin_code]);
      
      if (pinCodeResult.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Pin code already in use', 
          detail: 'Please use a different pin code.' 
        });
      }
    }
    
    // Get the next venue_id
    const maxIdQuery = 'SELECT COALESCE(MAX(venue_id), 0) as max_id FROM venue';
    const maxIdResult = await pool.query(maxIdQuery);
    const nextId = maxIdResult.rows[0].max_id + 1;
    
    // Insert new venue
    const q = 'INSERT INTO venue (venue_id, name, street, city, pin_code, capacity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING venue_id, name, street, city, pin_code, capacity';
    const { rows } = await pool.query(q, [nextId, name, street || null, city || null, pin_code || null, capacity]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add venue' });
  }
});

// PUT /api/venues/:id - update venue details
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, street, city, pin_code, capacity } = req.body;
  
  // Validate required fields
  if (!name || !capacity) {
    return res.status(400).json({ error: 'Name and capacity are required' });
  }
  
  try {
    // Check if pin_code already exists for another venue (if provided)
    if (pin_code) {
      const pinCodeCheck = 'SELECT 1 FROM venue WHERE pin_code = $1 AND venue_id != $2';
      const pinCodeResult = await pool.query(pinCodeCheck, [pin_code, id]);
      
      if (pinCodeResult.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Pin code already in use', 
          detail: 'Please use a different pin code.' 
        });
      }
    }
    
    // Update the venue
    const q = 'UPDATE venue SET name = $1, street = $2, city = $3, pin_code = $4, capacity = $5 WHERE venue_id = $6 RETURNING venue_id, name, street, city, pin_code, capacity';
    const { rows } = await pool.query(q, [name, street || null, city || null, pin_code || null, capacity, id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update venue' });
  }
});

// DELETE /api/venues/:id - delete a venue
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // Check if venue has associated concerts
    const concertCheck = 'SELECT 1 FROM concert WHERE venue_id = $1';
    const concertResult = await pool.query(concertCheck, [id]);
    
    if (concertResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete venue', 
        detail: 'This venue has associated concerts. Please delete the concerts first.' 
      });
    }
    
    const q = 'DELETE FROM venue WHERE venue_id = $1 RETURNING venue_id';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json({ message: 'Venue deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete venue' });
  }
});

module.exports = router;