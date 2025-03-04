const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const resourceRoutes = require('./routes/resources');
const transactionRoutes = require('./routes/transactions');
const finesRoutes = require('./routes/fines');
const categoriesRoutes = require('./routes/categories');

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// In backend/server.js add this temporary route
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

  // In backend/server.js add this temporary route
const bcrypt = require('bcrypt'); // Make sure this is at the top of your file

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