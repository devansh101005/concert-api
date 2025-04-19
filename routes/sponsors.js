// routes/sponsors.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/sponsors - list all sponsors
router.get('/', async (req, res) => {
  try {
    const q = 'SELECT sponsor_id, name, spons_amount FROM sponsorship ORDER BY name';
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// GET /api/sponsors/:id - get sponsor details
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const q = 'SELECT sponsor_id, name, spons_amount FROM sponsorship WHERE sponsor_id = $1';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Sponsor not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sponsor' });
  }
});

// POST /api/sponsors - add a new sponsor
router.post('/', async (req, res) => {
  const { name, spons_amount } = req.body;
  try {
    const q = 'INSERT INTO sponsorship (name, spons_amount) VALUES ($1, $2) RETURNING sponsor_id, name, spons_amount';
    const { rows } = await pool.query(q, [name, spons_amount]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add sponsor' });
  }
});

// PUT /api/sponsors/:id - update sponsor details
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, spons_amount } = req.body;
  try {
    const q = 'UPDATE sponsorship SET name = $1, spons_amount = $2 WHERE sponsor_id = $3 RETURNING sponsor_id, name, spons_amount';
    const { rows } = await pool.query(q, [name, spons_amount, id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Sponsor not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
});

// DELETE /api/sponsors/:id - delete a sponsor
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const q = 'DELETE FROM sponsorship WHERE sponsor_id = $1 RETURNING sponsor_id';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Sponsor not found' });
    res.json({ message: 'Sponsor deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete sponsor' });
  }
});

module.exports = router;
