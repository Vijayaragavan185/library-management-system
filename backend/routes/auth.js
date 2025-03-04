// backend/routes/auth.js - Update to include debugging
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);
    
    // Get user from database
    const [users] = await pool.query(
      'SELECT * FROM user_accounts WHERE username = ?',
      [username]
    );
    
    console.log(`Found ${users.length} users matching username`);
    
    if (users.length === 0) {
      console.log('No matching user found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    console.log(`Comparing password with hash: ${user.password_hash}`);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    console.log(`Password match result: ${isMatch}`);
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.account_id, role: user.role },
      process.env.JWT_SECRET || 'defaultsecretkey',
      { expiresIn: '8h' }
    );
    
    // Update last login
    await pool.query(
      'UPDATE user_accounts SET last_login = NOW() WHERE account_id = ?',
      [user.account_id]
    );
    
    console.log('Login successful, returning token');
    res.json({
      token,
      user: {
        id: user.account_id,
        username: user.username,
        role: user.role,
        student_id: user.student_id
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;