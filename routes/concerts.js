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
      LEFT JOIN venue v ON c.venue_id = v.venue_id
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

// POST /api/concerts - add a new concert
router.post('/', async (req, res) => {
  const { name, date, time, venue_id, organizer_id, spons_id } = req.body;
  console.log('POST /api/concerts body:', req.body);
  if (!name || !date || !time) {
    return res.status(400).json({ error: 'Name, date, and time are required' });
  }
  try {
    // Get the next concert_id by finding the maximum existing ID and adding 1
    const maxIdQuery = 'SELECT MAX(concert_id) FROM concert';
    const maxIdResult = await pool.query(maxIdQuery);
    const nextId = (maxIdResult.rows[0].max || 0) + 1;
    
    // Insert the new concert with the generated ID
    const insertQuery = `
      INSERT INTO concert (concert_id, name, date, time, venue_id, organizer_id, spons_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING concert_id, name, date, time, venue_id, organizer_id, spons_id
    `;
    const insertResult = await pool.query(
      insertQuery,
      [nextId, name, date, time, venue_id || null, organizer_id || null, spons_id || null]
    );
    
    console.log('Concert added successfully:', insertResult.rows[0]);
    res.status(201).json({ 
      message: 'Concert added successfully', 
      concert: insertResult.rows[0]
    });
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
      LEFT JOIN venue v ON c.venue_id = v.venue_id
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

// GET /api/concerts/:id/details - get concert details with performers and venue
router.get('/:id/details', async (req, res) => {
  const concertId = parseInt(req.params.id);
  if (isNaN(concertId)) {
    return res.status(400).json({ error: 'Invalid concert ID' });
  }
  try {
    // Direct SQL query instead of calling a function that doesn't exist
    const query = `
      SELECT c.concert_id, c.name, c.date, c.time,
             v.name AS venue_name, v.city AS venue_city, v.capacity AS venue_capacity,
             a.artist_id, a.first_name AS artist_first_name, a.last_name AS artist_last_name, 
             a.genre AS artist_genre, p.performance_time
      FROM concert c
      LEFT JOIN venue v ON c.venue_id = v.venue_id
      LEFT JOIN performs p ON c.concert_id = p.concert_id
      LEFT JOIN artist a ON p.artist_id = a.artist_id
      WHERE c.concert_id = $1
      ORDER BY p.performance_time
    `;
    
    const { rows } = await pool.query(query, [concertId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Concert not found' });
    }
    
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
    // Direct SQL query instead of calling a function that doesn't exist
    const query = `
      SELECT 
        COUNT(t.ticket_id) AS total_tickets,
        COALESCE(SUM(t.price), 0) AS total_revenue
      FROM ticket t
      WHERE t.concert_id = $1
    `;
    
    const { rows } = await pool.query(query, [concertId]);
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get ticket sales summary' });
  }
});

// DELETE /api/concerts/:id - delete a concert
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // Check if the concert is referenced in the performs table
    const checkPerformsQuery = 'SELECT 1 FROM performs WHERE concert_id = $1 LIMIT 1';
    const performsResult = await pool.query(checkPerformsQuery, [id]);
    
    if (performsResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete concert', 
        detail: 'This concert has associated performances. Remove these associations first.' 
      });
    }
    
    const q = 'DELETE FROM concert WHERE concert_id = $1 RETURNING concert_id';
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Concert not found' });
    res.json({ message: 'Concert deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete concert' });
  }
});

module.exports = router;
