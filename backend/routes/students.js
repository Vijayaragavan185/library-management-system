// const express = require('express');
// const router = express.Router();
// const pool = require('../config/db');

// // Get all students
// router.get('/', async (req, res) => {
//   try {
//     const [students] = await pool.query('SELECT * FROM students');
//     res.json(students);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get pending students - place this BEFORE the /:id route to prevent confusion
// // Get students (including those registered recently)
// router.get('/pending', async (req, res) => {
//   try {
//     // Modify query to not use ua.created_at
//     const [students] = await pool.query(
//       `SELECT s.*, ua.username 
//        FROM students s
//        JOIN user_accounts ua ON s.student_id = ua.student_id
//        ORDER BY ua.last_login DESC  /* using last_login instead of created_at */
//        LIMIT 10`
//     );
//     res.json(students);
//   } catch (error) {
//     console.error('Error fetching pending students:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get student by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const [students] = await pool.query(
//       'SELECT * FROM students WHERE student_id = ?',
//       [req.params.id]
//     );
    
//     if (students.length === 0) {
//       return res.status(404).json({ message: 'Student not found' });
//     }
    
//     res.json(students[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create new student
// router.post('/', async (req, res) => {
//   try {
//     const { student_id, name, department, email } = req.body;
    
//     await pool.query(
//       'INSERT INTO students (student_id, name, department, email, status) VALUES (?, ?, ?, ?, ?)',
//       [student_id, name, department, email, 'active']
//     );
    
//     res.status(201).json({ message: 'Student created successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Approve a student
// router.patch('/:id/approve', async (req, res) => {
//   try {
//     await pool.query(
//       'UPDATE students SET status = ? WHERE student_id = ?',
//       ['active', req.params.id]
//     );
//     res.json({ message: 'Student approved successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Reject a student
// router.patch('/:id/reject', async (req, res) => {
//   try {
//     await pool.query(
//       'UPDATE students SET status = ? WHERE student_id = ?',
//       ['suspended', req.params.id]
//     );
//     res.json({ message: 'Student rejected successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
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

// Get pending students - place this BEFORE the /:id route to prevent confusion
// Get students (including those registered recently)
router.get('/pending', async (req, res) => {
  try {
    // Modified query to join with account_usernames table for normalized schema
    const [students] = await pool.query(
      `SELECT s.*, an.username 
       FROM students s
       JOIN user_accounts ua ON s.student_id = ua.student_id
       JOIN account_usernames an ON ua.account_id = an.account_id
       ORDER BY ua.last_login DESC
       LIMIT 10`
    );
    res.json(students);
  } catch (error) {
    console.error('Error fetching pending students:', error);
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
    
    // Insert into students table
    await pool.query(
      'INSERT INTO students (student_id, name, department, status) VALUES (?, ?, ?, ?)',
      [student_id, name, department, 'active']
    );
    
    // Insert email into student_emails table
    if (email) {
      await pool.query(
        'INSERT INTO student_emails (email, student_id) VALUES (?, ?)',
        [email, student_id]
      );
    }
    
    res.status(201).json({ message: 'Student created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a student
router.patch('/:id/approve', async (req, res) => {
  try {
    await pool.query(
      'UPDATE students SET status = ? WHERE student_id = ?',
      ['active', req.params.id]
    );
    res.json({ message: 'Student approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a student
router.patch('/:id/reject', async (req, res) => {
  try {
    await pool.query(
      'UPDATE students SET status = ? WHERE student_id = ?',
      ['suspended', req.params.id]
    );
    res.json({ message: 'Student rejected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student with email (extended info)
router.get('/:id/extended', async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT s.*, se.email
       FROM students s
       LEFT JOIN student_emails se ON s.student_id = se.student_id
       WHERE s.student_id = ?`,
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
// Add to backend/routes/students.js
router.put('/:id', async (req, res) => {
  try {
    const { name, department, status } = req.body;
    
    await pool.query(
      'UPDATE students SET name = ?, department = ?, status = ? WHERE student_id = ?',
      [name, department, status || 'active', req.params.id]
    );
    
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
