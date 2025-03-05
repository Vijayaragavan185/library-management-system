// backend/routes/auth.js
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
    
    // Get user from database with join to get student information when needed
    const [users] = await pool.query(
      `SELECT ua.*, s.name as student_name, s.department, s.email
       FROM user_accounts ua
       LEFT JOIN students s ON ua.student_id = s.student_id
       WHERE ua.username = ?`,
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
    
    // Create JWT token with role information
    const token = jwt.sign(
      { 
        id: user.account_id, 
        role: user.role,
        student_id: user.student_id || null
      },
      process.env.JWT_SECRET || 'defaultsecretkey',
      { expiresIn: '8h' }
    );
    
    // Update last login
    await pool.query(
      'UPDATE user_accounts SET last_login = NOW() WHERE account_id = ?',
      [user.account_id]
    );
    
    console.log(`Login successful for ${username} with role: ${user.role}`);
    
    // Return user info including role and student_id for routing decisions
    res.json({
      token,
      user: {
        id: user.account_id,
        username: user.username,
        role: user.role,
        student_id: user.student_id || null,
        name: user.student_name || null
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add this route to your existing auth.js file
router.post('/simple-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Simple login attempt for ${username} with password ${password}`);
    
    // Get user info without password check
    const [users] = await pool.query(
      `SELECT ua.*, s.name as student_name, s.department, s.email
       FROM user_accounts ua
       LEFT JOIN students s ON ua.student_id = s.student_id
       WHERE ua.username = ?`,
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // For testing, just check hardcoded values
    if ((username === 'student' && password === 'student123') || 
        (username === 'admin' && password === 'password123')) {
      
      // Create token
      const token = jwt.sign(
        { 
          id: user.account_id, 
          role: user.role,
          student_id: user.student_id || null
        },
        process.env.JWT_SECRET || 'defaultsecretkey',
        { expiresIn: '8h' }
      );
      
      // Update last login
      await pool.query(
        'UPDATE user_accounts SET last_login = NOW() WHERE account_id = ?',
        [user.account_id]
      );
      
      console.log(`Simple login successful for ${username} with role: ${user.role}`);
      return res.json({
        token,
        user: {
          id: user.account_id,
          username: user.username,
          role: user.role,
          student_id: user.student_id || null,
          name: user.student_name || null
        }
      });
    }
    
    console.log('Simple login failed - invalid credentials');
    return res.status(401).json({ message: 'Invalid credentials' });
    
  } catch (error) {
    console.error('Simple login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple route to check if a user is authenticated and get their role
router.get('/me', async (req, res) => {
  try {
    // Extract token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecretkey');
    
    // Get user info
    const [users] = await pool.query(
      `SELECT ua.*, s.name as student_name
       FROM user_accounts ua 
       LEFT JOIN students s ON ua.student_id = s.student_id
       WHERE ua.account_id = ?`,
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Return user info
    res.json({
      id: user.account_id,
      username: user.username,
      role: user.role,
      student_id: user.student_id || null,
      name: user.student_name || null
    });
    
  } catch (error) {
    console.error('Auth check error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;