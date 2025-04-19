const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Mock user database
const users = [];

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Signup Route
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Check if user already exists
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user to the database
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: "User created successfully" });
});

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Find user in the database
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  // Generate JWT
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

// Logout Route
router.post("/logout", (req, res) => {
  // Invalidate token (handled on the client-side by deleting it)
  res.json({ message: "Logout successful" });
});

module.exports = router;