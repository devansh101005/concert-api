// routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM concert) AS total_concerts,
        (SELECT COUNT(*) FROM artist) AS total_artists,
        (SELECT COUNT(*) FROM venue) AS total_venues,
        (SELECT COUNT(*) FROM organizer) AS total_organizers,
        (SELECT COUNT(*) FROM sponsorship) AS total_sponsors,
        (SELECT COUNT(*) FROM staff) AS total_staff,
        (SELECT COUNT(*) FROM ticket) AS total_tickets_sold,
        (SELECT COALESCE(SUM(amount), 0) FROM payment) AS total_revenue
    `;
    const { rows } = await pool.query(statsQuery);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
