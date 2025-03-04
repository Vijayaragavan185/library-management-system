// Create a new file named 'reset-password.js' in your backend directory
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'library_management'
    });
    
    // Generate a new password hash
    const plainPassword = 'admin123'; // Simple password for testing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);
    
    console.log(`New password will be: ${plainPassword}`);
    console.log(`Generated hash: ${passwordHash}`);
    
    // Update or create admin user
    
    // First check if ADMIN001 exists in students table
    const [existingStudents] = await connection.query(
      'SELECT * FROM students WHERE student_id = ?',
      ['ADMIN001']
    );
    
    if (existingStudents.length === 0) {
      console.log('Creating admin student record...');
      await connection.query(
        'INSERT INTO students (student_id, name, department, email, status) VALUES (?, ?, ?, ?, ?)',
        ['ADMIN001', 'System Admin', 'IT', 'admin@library.com', 'active']
      );
    } else {
      console.log('Admin student record exists.');
    }
    
    // Check if admin user exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM user_accounts WHERE username = ?',
      ['admin']
    );
    
    if (existingUsers.length === 0) {
      console.log('Creating admin user account...');
      await connection.query(
        'INSERT INTO user_accounts (student_id, username, password_hash, role) VALUES (?, ?, ?, ?)',
        ['ADMIN001', 'admin', passwordHash, 'admin']
      );
      console.log('Admin user created successfully!');
    } else {
      console.log('Updating existing admin password...');
      await connection.query(
        'UPDATE user_accounts SET password_hash = ? WHERE username = ?',
        [passwordHash, 'admin']
      );
      console.log('Admin password updated successfully!');
    }
    
    console.log(`Admin password is now: ${plainPassword}`);
    
    await connection.end();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

resetAdminPassword();