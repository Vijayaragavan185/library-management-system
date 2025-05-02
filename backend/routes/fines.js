// backend/routes/fines.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { withTransaction } = require('../utils/transactionHelper');

// Get all fines with joined data from fine_details
router.get('/', async (req, res) => {
  try {
    const [fines] = await pool.query(`
      SELECT f.fine_id, f.transaction_id, f.status, f.issue_date, f.payment_date, f.notes,
             fd.amount, fd.reason,
             tm.student_id, tm.resource_id, 
             s.name as student_name, 
             r.title as resource_title
      FROM fines f
      JOIN fine_details fd ON f.transaction_id = fd.transaction_id
      JOIN transactions t ON f.transaction_id = t.transaction_id
      JOIN transaction_mapping tm ON t.transaction_id = tm.transaction_id
      JOIN students s ON tm.student_id = s.student_id
      JOIN resources r ON tm.resource_id = r.resource_id
    `);
    res.json(fines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get fines by student ID with fine_details
router.get('/student/:id', async (req, res) => {
  try {
    const [fines] = await pool.query(`
      SELECT f.fine_id, f.transaction_id, f.status, f.issue_date, f.payment_date, f.notes,
             fd.amount, fd.reason,
             tm.student_id, tm.resource_id, 
             r.title as resource_title
      FROM fines f
      JOIN fine_details fd ON f.transaction_id = fd.transaction_id
      JOIN transactions t ON f.transaction_id = t.transaction_id
      JOIN transaction_mapping tm ON t.transaction_id = tm.transaction_id
      JOIN resources r ON tm.resource_id = r.resource_id
      WHERE tm.student_id = ?
    `, [req.params.id]);
    
    res.json(fines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new fine (inserting into both tables)
router.post('/', async (req, res) => {
  try {
    const { transaction_id, amount, reason, notes } = req.body;
    
    // Use transaction to ensure both inserts succeed or fail together
    await withTransaction(async (connection) => {
      // Insert into fines table (without amount and reason)
      await connection.query(
        'INSERT INTO fines (transaction_id, status, issue_date, notes) VALUES (?, ?, NOW(), ?)',
        [transaction_id, 'pending', notes]
      );
      
      // Insert into fine_details table with amount and reason
      await connection.query(
        'INSERT INTO fine_details (transaction_id, amount, reason) VALUES (?, ?, ?)',
        [transaction_id, amount, reason]
      );
    });
    
    res.status(201).json({ message: 'Fine created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update fine payment status
router.patch('/:id/pay', async (req, res) => {
  try {
    await pool.query(
      'UPDATE fines SET status = ?, payment_date = NOW() WHERE fine_id = ?',
      ['paid', req.params.id]
    );
    
    res.json({ message: 'Fine marked as paid' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Waive a fine
router.patch('/:id/waive', async (req, res) => {
  try {
    await pool.query(
      'UPDATE fines SET status = ? WHERE fine_id = ?',
      ['waived', req.params.id]
    );
    
    res.json({ message: 'Fine waived successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
