// routes/staff.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/staff - list all staff members
router.get('/', async (req, res) => {
  try {
    const q = 'SELECT staff_id, name, role, contact_info, concert_id FROM staff ORDER BY name';
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// GET /api/staff/:id - get staff member details
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const q = 'SELECT staff_id, name, role, contact_info, concert_id FROM staff WHERE staff_id = $1';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

// POST /api/staff - add a new staff member
router.post('/', async (req, res) => {
  const { name, role, contact_info, concert_id } = req.body;
  try {
    // First check if the concert exists
    const concertCheck = 'SELECT 1 FROM concert WHERE concert_id = $1';
    const concertResult = await pool.query(concertCheck, [concert_id]);
    
    if (concertResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid concert ID', 
        detail: `Concert with ID ${concert_id} does not exist.` 
      });
    }
    
    // If concert exists, proceed with inserting the staff member
    const q = 'INSERT INTO staff (name, role, contact_info, concert_id) VALUES ($1, $2, $3, $4) RETURNING staff_id, name, role, contact_info, concert_id';
    const { rows } = await pool.query(q, [name, role, contact_info, concert_id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add staff member' });
  }
});

// PUT /api/staff/:id - update staff member details
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, role, contact_info, concert_id } = req.body;
  try {
    // First check if the concert exists
    const concertCheck = 'SELECT 1 FROM concert WHERE concert_id = $1';
    const concertResult = await pool.query(concertCheck, [concert_id]);
    
    if (concertResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid concert ID', 
        detail: `Concert with ID ${concert_id} does not exist.` 
      });
    }
    
    // If concert exists, proceed with updating the staff member
    const q = 'UPDATE staff SET name = $1, role = $2, contact_info = $3, concert_id = $4 WHERE staff_id = $5 RETURNING staff_id, name, role, contact_info, concert_id';
    const { rows } = await pool.query(q, [name, role, contact_info, concert_id, id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// DELETE /api/staff/:id - delete a staff member
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const q = 'DELETE FROM staff WHERE staff_id = $1 RETURNING staff_id';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

module.exports = router;
