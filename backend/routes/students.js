const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all students
router.get('/', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT * FROM students');
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const [students] = await pool.query(
      'SELECT * FROM students WHERE student_id = ?',
      [req.params.id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(students[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const { student_id, name, department, email } = req.body;
    
    await pool.query(
      'INSERT INTO students (student_id, name, department, email, status) VALUES (?, ?, ?, ?, ?)',
      [student_id, name, department, email, 'active']
    );
    
    res.status(201).json({ message: 'Student created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;