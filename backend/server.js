const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const resourceRoutes = require('./routes/resources');
const transactionRoutes = require('./routes/transactions');
const finesRoutes = require('./routes/fines');
const categoriesRoutes = require('./routes/categories');
const bcrypt = require('bcrypt'); // Only declare once
const pool = require('./config/db'); // Add this line to import your database connection

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fines', finesRoutes);
app.use('/api/categories', categoriesRoutes);

// Setup admin route
app.get('/setup-admin', async (req, res) => {
  try {
    // Create a simple password hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    console.log('Generated password hash:', passwordHash);
    
    // Check if admin exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM user_accounts WHERE username = ?', 
      ['admin']
    );
    
    if (existingUsers.length > 0) {
      // Update existing admin
      await pool.query(
        'UPDATE user_accounts SET password_hash = ? WHERE username = ?',
        [passwordHash, 'admin']
      );
      res.send('Admin password updated');
    } else {
      // Check if student exists
      const [existingStudents] = await pool.query(
        'SELECT * FROM students WHERE student_id = ?',
        ['ADMIN001']
      );
      
      if (existingStudents.length === 0) {
        // Create student
        await pool.query(
          'INSERT INTO students (student_id, name, department, email, status) VALUES (?, ?, ?, ?, ?)',
          ['ADMIN001', 'System Admin', 'IT', 'admin@library.com', 'active']
        );
      }
      
      // Create admin user
      await pool.query(
        'INSERT INTO user_accounts (student_id, username, password_hash, role) VALUES (?, ?, ?, ?)',
        ['ADMIN001', 'admin', passwordHash, 'admin']
      );
      
      res.send('Admin user created');
    }
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).send('Error setting up admin');
  }
});

// Reset admin password route
app.get('/reset-admin-password', async (req, res) => {
  try {
    // Create a simple password hash for "password123"
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    console.log('Generated new password hash:', passwordHash);
    
    // Update admin password
    const [result] = await pool.query(
      'UPDATE user_accounts SET password_hash = ? WHERE username = ?',
      [passwordHash, 'admin']
    );
    
    if (result.affectedRows > 0) {
      res.send('Admin password reset successfully. Try logging in with "password123"');
    } else {
      res.send('Admin user not found. Please check your database.');
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).send('Error resetting admin password');
  }
});

// Generate hash route
app.get('/generate-hash', async (req, res) => {
  try {
    const password = 'student123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    res.send(`Password: ${password}<br>Hash: ${hash}`);
  } catch (error) {
    res.status(500).send('Error generating hash');
  }
});

// Setup student route
app.get('/setup-student', async (req, res) => {
  try {
    // Create a simple password hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('student123', salt);
    
    console.log('Generated student password hash:', passwordHash);
    
    // Check if student exists
    const [existingStudents] = await pool.query(
      'SELECT * FROM students WHERE student_id = ?',
      ['S12345']
    );
    
    if (existingStudents.length === 0) {
      // Create student record
      await pool.query(
        'INSERT INTO students (student_id, name, department, email, status) VALUES (?, ?, ?, ?, ?)',
        ['S12345', 'John Student', 'Computer Science', 'student@example.com', 'active']
      );
    }
    
    // Check if student user account exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM user_accounts WHERE username = ?',
      ['student']
    );
    
    if (existingUsers.length > 0) {
      // Update existing student user
      await pool.query(
        'UPDATE user_accounts SET password_hash = ? WHERE username = ?',
        [passwordHash, 'student']
      );
      res.send('Student user updated successfully');
    } else {
      // Create student user account
      await pool.query(
        'INSERT INTO user_accounts (student_id, username, password_hash, role) VALUES (?, ?, ?, ?)',
        ['S12345', 'student', passwordHash, 'student']
      );
      res.send('Student user created successfully');
    }
  } catch (error) {
    console.error('Setup student error:', error);
    res.status(500).send('Error setting up student: ' + error.message);
  }
});

// Add this to your server.js
app.get('/test-password', async (req, res) => {
  try {
    const password = 'student123';
    
    // Generate a new hash
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(password, salt);
    
    // Immediately test this hash with the same password
    const isMatch = await bcrypt.compare(password, newHash);
    
    res.send(`
      <h3>Password Test</h3>
      <p>Password: ${password}</p>
      <p>Generated hash: ${newHash}</p>
      <p>Verification result: ${isMatch ? 'MATCH' : 'NO MATCH'}</p>
      <hr>
      <h3>Create Student Account with New Hash</h3>
      <a href="/create-student-with-new-hash">Click here to create/update student account with this new hash</a>
    `);
  } catch (error) {
    res.status(500).send('Error testing password: ' + error.message);
  }
});

app.get('/create-student-with-new-hash', async (req, res) => {
  try {
    const password = 'student123';
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(password, salt);
    
    // Create or update student record
    const [existingStudents] = await pool.query(
      'SELECT * FROM students WHERE student_id = ?',
      ['S12345']
    );
    
    if (existingStudents.length === 0) {
      await pool.query(
        'INSERT INTO students (student_id, name, department, email, status) VALUES (?, ?, ?, ?, ?)',
        ['S12345', 'John Student', 'Computer Science', 'student@example.com', 'active']
      );
    }
    
    // Update or create student user account
    const [existingUsers] = await pool.query(
      'SELECT * FROM user_accounts WHERE username = ?',
      ['student']
    );
    
    if (existingUsers.length > 0) {
      await pool.query(
        'UPDATE user_accounts SET password_hash = ? WHERE username = ?',
        [newHash, 'student']
      );
    } else {
      await pool.query(
        'INSERT INTO user_accounts (student_id, username, password_hash, role) VALUES (?, ?, ?, ?)',
        ['S12345', 'student', newHash, 'student']
      );
    }
    
    res.send(`
      <h3>Student Account Created/Updated</h3>
      <p>Username: student</p>
      <p>Password: ${password}</p>
      <p>New hash: ${newHash}</p>
      <p>Try logging in with these credentials now.</p>
    `);
  } catch (error) {
    res.status(500).send('Error creating student: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});