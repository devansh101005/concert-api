const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/concerts
router.get('/', async (req, res) => {
  try {
    const {
      location,
      city,
      min_capacity,
      max_capacity,
      start_date,
      end_date,
      genre,
      spons_id
    } = req.query;

    let baseQuery = `
      SELECT DISTINCT c.concert_id, c.name, c.date, c.time,
             v.name AS venue, v.city
      FROM concert c
      JOIN venue v ON c.venue_id = v.venue_id
      LEFT JOIN concert_location cl ON c.concert_id = cl.concert_id
      LEFT JOIN performs p ON c.concert_id = p.concert_id
      LEFT JOIN artist a ON p.artist_id = a.artist_id
    `;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (location) {
      conditions.push(`cl.location ILIKE $${paramIndex++}`);
      params.push(`%${location}%`);
    }
    if (city) {
      conditions.push(`v.city ILIKE $${paramIndex++}`);
      params.push(`%${city}%`);
    }
    if (min_capacity) {
      conditions.push(`v.capacity >= $${paramIndex++}`);
      params.push(min_capacity);
    }
    if (max_capacity) {
      conditions.push(`v.capacity <= $${paramIndex++}`);
      params.push(max_capacity);
    }
    if (start_date) {
      conditions.push(`c.date >= $${paramIndex++}`);
      params.push(start_date);
    }
    if (end_date) {
      conditions.push(`c.date <= $${paramIndex++}`);
      params.push(end_date);
    }
    if (genre) {
      conditions.push(`a.genre ILIKE $${paramIndex++}`);
      params.push(`%${genre}%`);
    }
    if (spons_id) {
      conditions.push(`c.spons_id = $${paramIndex++}`);
      params.push(spons_id);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ' ORDER BY c.date;';

    const { rows } = await pool.query(baseQuery, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/concerts - add a new concert using stored procedure
router.post('/', async (req, res) => {
  const { name, date, time, venue_id, organizer_id, spons_id } = req.body;
  console.log('POST /api/concerts body:', req.body);
  if (!name || !date || !time) {
    return res.status(400).json({ error: 'Name, date, and time are required' });
  }
  try {
    const result = await pool.query(
      `CALL add_concert($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, date, time, venue_id || null, organizer_id || null, spons_id || null, null, null]
    );
    console.log('Stored procedure call result:', result);
    res.status(201).json({ message: 'Concert added successfully', concert: { name, date, time, venue_id, organizer_id, spons_id } });
  } catch (err) {
    console.error('Error in POST /api/concerts:', err);
    res.status(500).json({ error: 'Failed to add concert', details: err.message });
  }
});

// GET /api/concerts/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const concertQ = `
      SELECT c.concert_id, c.name, c.date, c.time,
             v.name AS venue, v.city
      FROM concert c
      JOIN venue v ON c.venue_id = v.venue_id
      WHERE c.concert_id = $1;
    `;
    const concertR = await pool.query(concertQ, [id]);
    if (!concertR.rows.length)
      return res.status(404).json({ error: 'Not found' });

    const perfQ = `
      SELECT a.artist_id, a.first_name, a.last_name, a.genre, p.performance_time
      FROM performs p
      JOIN artist a ON p.artist_id = a.artist_id
      WHERE p.concert_id = $1
      ORDER BY p.performance_time;
    `;
    const perfR = await pool.query(perfQ, [id]);

    res.json({ concert: concertR.rows[0], performers: perfR.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


module.exports = router;

// GET /api/concerts/:id/details - get concert details with performers and venue
router.get('/:id/details', async (req, res) => {
  const concertId = parseInt(req.params.id);
  if (isNaN(concertId)) {
    return res.status(400).json({ error: 'Invalid concert ID' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM get_concert_details($1)', [concertId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get concert details' });
  }
});

// GET /api/concerts/:id/sales-summary - get ticket sales summary for a concert
router.get('/:id/sales-summary', async (req, res) => {
  const concertId = parseInt(req.params.id);
  if (isNaN(concertId)) {
    return res.status(400).json({ error: 'Invalid concert ID' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM get_ticket_sales_summary($1)', [concertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get ticket sales summary' });
  }
});
