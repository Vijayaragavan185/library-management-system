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
// Replace your existing simple-login route with this one
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
    
    // If user exists in database
    if (users.length > 0) {
      const user = users[0];
      console.log(`User found, accepting login with role: ${user.role}`);
      
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
    // If username is 'admin', create an admin login
    else if (username === 'admin') {
      console.log('Creating admin session for login attempt');
      const token = jwt.sign(
        { 
          id: 999,
          role: 'admin',
          student_id: null
        },
        process.env.JWT_SECRET || 'defaultsecretkey',
        { expiresIn: '8h' }
      );
      
      return res.json({
        token,
        user: {
          id: 999,
          username: 'admin',
          role: 'admin',
          student_id: null,
          name: 'Administrator'
        }
      });
    } 
    // If username is 'student', create a student login
    else if (username === 'student') {
      console.log('Creating student session for login attempt');
      const token = jwt.sign(
        { 
          id: 998,
          role: 'student',
          student_id: 'S12345'
        },
        process.env.JWT_SECRET || 'defaultsecretkey',
        { expiresIn: '8h' }
      );
      
      return res.json({
        token,
        user: {
          id: 998,
          username: 'student',
          role: 'student',
          student_id: 'S12345',
          name: 'Student User'
        }
      });
    }
    // For any other username
    else {
      console.log('Creating default admin session for unknown user');
      const token = jwt.sign(
        { 
          id: 997,
          role: 'admin',
          student_id: null
        },
        process.env.JWT_SECRET || 'defaultsecretkey',
        { expiresIn: '8h' }
      );
      
      return res.json({
        token,
        user: {
          id: 997,
          username: username,
          role: 'admin',
          student_id: null,
          name: 'Guest Admin'
        }
      });
    }
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
// backend/routes/auth.js - Add this registration route
// Improved error handling for the registration route
// router.post('/register', async (req, res) => {
//   try {
//     const { student_id, name, email, department, username, password } = req.body;
    
//     console.log('Registration attempt with data:', { student_id, name, email, department, username });
    
//     // Validate required fields
//     if (!student_id || !name || !email || !department || !username || !password) {
//       return res.status(400).json({ 
//         message: 'All fields are required',
//         missing: Object.entries({ student_id, name, email, department, username, password })
//           .filter(([_, value]) => !value)
//           .map(([key]) => key)
//       });
//     }
    
//     // Check if student_id already exists
//     const [existingStudents] = await pool.query(
//       'SELECT * FROM students WHERE student_id = ?',
//       [student_id]
//     );
    
//     if (existingStudents.length > 0) {
//       return res.status(400).json({ message: 'Student ID already registered' });
//     }
    
//     // Check if username already exists
//     const [existingUsers] = await pool.query(
//       'SELECT * FROM user_accounts WHERE username = ?',
//       [username]
//     );
    
//     if (existingUsers.length > 0) {
//       return res.status(400).json({ message: 'Username already taken' });
//     }
    
//     // Create student record
//     await pool.query(
//       'INSERT INTO students (student_id, name, department, email, status) VALUES (?, ?, ?, ?, ?)',
//       [student_id, name, department, email, 'pending']
//     );
    
//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);
    
//     // Create user account
//     await pool.query(
//       'INSERT INTO user_accounts (student_id, username, password_hash, role) VALUES (?, ?, ?, ?)',
//       [student_id, username, passwordHash, 'student']
//     );
    
//     console.log(`Registration successful for student: ${student_id}, username: ${username}`);
    
//     res.status(201).json({ 
//       message: 'Registration successful. Please wait for admin approval.' 
//     });
    
//   } catch (error) {
//     console.error('Registration error details:', error.message, error.stack);
    
//     // Check for specific MySQL errors
//     if (error.code === 'ER_DUP_ENTRY') {
//       return res.status(400).json({ message: 'A user with this ID or username already exists' });
//     }
    
//     res.status(500).json({ 
//       message: 'Server error during registration',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });
// Enhanced backend validation in auth.js
router.post('/register', async (req, res) => {
  try {
    const { student_id, name, email, department, phone, username, password } = req.body;
    
    // Enhanced validation
    // Student ID validation
    if (!/^[A-Z0-9]+$/.test(student_id)) {
      return res.status(400).json({ 
        message: 'Invalid student ID format. Use only uppercase letters and numbers.' 
      });
    }
    
    // Name validation
    if (!/^[A-Za-z\s-]+$/.test(name) || name.length < 2) {
      return res.status(400).json({ 
        message: 'Invalid name format. Use only letters, spaces, and hyphens.' 
      });
    }
    
    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email address format.' 
      });
    }
    
    // Phone validation (if provided)
    if (phone && !/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ 
        message: 'Phone number must contain 10-15 digits only.' 
      });
    }
    
    // Username validation
    if (!/^[a-zA-Z0-9]{5,20}$/.test(username)) {
      return res.status(400).json({ 
        message: 'Username must be 5-20 alphanumeric characters.' 
      });
    }
    
    // Password strength validation
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with at least one letter, one number, and one special character.' 
      });
    }

    // Existing validation logic for duplicate checks
    const [existingStudents] = await pool.query(
      'SELECT * FROM students WHERE student_id = ?',
      [student_id]
    );
    
    if (existingStudents.length > 0) {
      return res.status(400).json({ message: 'Student ID already registered' });
    }
    
    // Check if username already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM user_accounts WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Create student record
    await pool.query(
      'INSERT INTO students (student_id, name, department, email, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, name, department, email, phone || null, 'pending']
    );
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create user account
    await pool.query(
      'INSERT INTO user_accounts (student_id, username, password_hash, role) VALUES (?, ?, ?, ?)',
      [student_id, username, passwordHash, 'student']
    );
    
    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

module.exports = router;