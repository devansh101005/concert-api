// routes/concerts.js
const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/concerts
router.get('/', async (req, res) => {
  try {
    const q = `
      SELECT c.concert_id, c.name, c.date, c.time,
             v.name AS venue, v.city
      FROM concert c
      JOIN venue v ON c.venue_id = v.venue_id
      ORDER BY c.date;
    `;
    const { rows } = await pool.query(q);
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
  