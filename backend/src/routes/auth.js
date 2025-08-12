// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();

// สมัคร
router.post('/register', async (req, res) => {
  try {
    const { email, password, display_name } = req.body;
    if (!email || !password || !display_name) {
      return res.status(400).json({ message: 'email, password, display_name required' });
    }

    // เช็คซ้ำ
    const [dup] = await pool.query('SELECT id FROM users WHERE email = :email', { email });
    if (dup.length) return res.status(409).json({ message: 'Email already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES (:email, :password_hash, :display_name)',
      { email, password_hash, display_name }
    );

    const token = jwt.sign(
      { sub: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, user: { id: result.insertId, email, display_name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ล็อกอิน
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = :email', { email });
    if (!rows.length) return res.status(401).json({ message: 'Invalid email or password' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { id: user.id, email: user.email, display_name: user.display_name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
