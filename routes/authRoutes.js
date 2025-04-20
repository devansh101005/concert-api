const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM buyer WHERE email_id = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const user = result.rows[0];

    // For now, assuming password stored in plaintext (as per data.sql)
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT with buyerId
    const token = jwt.sign({ buyerId: user.buyer_id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  // Invalidate token (handled on the client-side by deleting it)
  res.json({ message: "Logout successful" });
});

module.exports = router;
