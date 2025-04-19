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
  try {
    const q = 'INSERT INTO organizer (first_name, last_name, contact_info) VALUES ($1, $2, $3) RETURNING organizer_id, first_name, last_name, contact_info';
    const { rows } = await pool.query(q, [first_name, last_name, contact_info]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add organizer' });
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
    res.status(500).json({ error: 'Failed to delete organizer' });
  }
});

module.exports = router;
