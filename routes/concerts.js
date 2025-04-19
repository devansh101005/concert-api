// routes/concerts.js
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

module.exports = router;



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
  