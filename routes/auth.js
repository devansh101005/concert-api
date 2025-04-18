



// routes/auth.js
const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const insQ = `
      INSERT INTO buyer (first_name, last_name, email_id, phone_no, password)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING buyer_id;
    `;
    const { rows } = await pool.query(insQ, [firstName, lastName, email, phone, hash]);
    const token = jwt.sign({ buyerId: rows[0].buyer_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});





// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const userQ = `SELECT buyer_id, password FROM buyer WHERE email_id = $1;`;
      const uR = await pool.query(userQ, [email]);
      if (!uR.rows.length) return res.status(401).json({ error: 'Invalid creds' });
  
      const { buyer_id, password: hash } = uR.rows[0];
      const ok = await bcrypt.compare(password, hash);
      if (!ok) return res.status(401).json({ error: 'Invalid creds' });
  
      const token = jwt.sign({ buyerId: buyer_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

module.exports = router;
  