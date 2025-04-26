// routes/artists.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/artists - list all artists
router.get('/', async (req, res) => {
  try {
    const q = 'SELECT artist_id, first_name, last_name, genre, contact_info FROM artist ORDER BY last_name, first_name';
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// GET /api/artists/:id - get artist details
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const q = 'SELECT artist_id, first_name, last_name, genre, contact_info FROM artist WHERE artist_id = $1';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Artist not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

// POST /api/artists - add a new artist
router.post('/', async (req, res) => {
  const { first_name, last_name, genre, contact_info } = req.body;
  
  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }
  
  try {
    // Get the next artist_id by finding the maximum existing ID and adding 1
    const maxIdQuery = 'SELECT MAX(artist_id) FROM artist';
    const maxIdResult = await pool.query(maxIdQuery);
    const nextId = (maxIdResult.rows[0].max || 0) + 1;
    
    const q = 'INSERT INTO artist (artist_id, first_name, last_name, genre, contact_info) VALUES ($1, $2, $3, $4, $5) RETURNING artist_id, first_name, last_name, genre, contact_info';
    const { rows } = await pool.query(q, [nextId, first_name, last_name, genre || null, contact_info || null]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add artist' });
  }
});

// PUT /api/artists/:id - update artist details
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { first_name, last_name, genre, contact_info } = req.body;
  
  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }
  
  try {
    const q = 'UPDATE artist SET first_name = $1, last_name = $2, genre = $3, contact_info = $4 WHERE artist_id = $5 RETURNING artist_id, first_name, last_name, genre, contact_info';
    const { rows } = await pool.query(q, [first_name, last_name, genre || null, contact_info || null, id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Artist not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

// DELETE /api/artists/:id - delete an artist
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // Check if the artist is referenced in the performs table
    const checkPerformsQuery = 'SELECT 1 FROM performs WHERE artist_id = $1 LIMIT 1';
    const performsResult = await pool.query(checkPerformsQuery, [id]);
    
    if (performsResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete artist', 
        detail: 'This artist is associated with one or more performances. Remove these associations first.' 
      });
    }
    
    const q = 'DELETE FROM artist WHERE artist_id = $1 RETURNING artist_id';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Artist not found' });
    res.json({ message: 'Artist deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete artist' });
  }
});

module.exports = router;