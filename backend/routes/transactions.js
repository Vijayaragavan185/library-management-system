const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const [transactions] = await pool.query(`
      SELECT t.*, s.name as student_name, r.title as resource_title 
      FROM transactions t
      JOIN students s ON t.student_id = s.student_id
      JOIN resources r ON t.resource_id = r.resource_id
    `);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check out a resource
router.post('/checkout', async (req, res) => {
  try {
    const { student_id, resource_id, due_days = 14 } = req.body;
    
    // Check if resource is available
    const [resources] = await pool.query(
      'SELECT * FROM resources WHERE resource_id = ? AND status = ?',
      [resource_id, 'available']
    );
    
    if (resources.length === 0) {
      return res.status(400).json({ message: 'Resource is not available' });
    }
    
    // Create transaction
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + due_days);
    
    await pool.query(
      'INSERT INTO transactions (student_id, resource_id, checkout_time, due_time) VALUES (?, ?, NOW(), ?)',
      [student_id, resource_id, dueDate]
    );
    
    // Update resource status
    await pool.query(
      'UPDATE resources SET status = ? WHERE resource_id = ?',
      ['borrowed', resource_id]
    );
    
    res.status(201).json({ message: 'Resource checked out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Return a resource
router.post('/return', async (req, res) => {
  try {
    const { transaction_id } = req.body;
    
    // Get transaction details
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE transaction_id = ? AND return_time IS NULL',
      [transaction_id]
    );
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found or already returned' });
    }
    
    const transaction = transactions[0];
    
    // Update transaction
    await pool.query(
      'UPDATE transactions SET return_time = NOW() WHERE transaction_id = ?',
      [transaction_id]
    );
    
    // Update resource status
    await pool.query(
      'UPDATE resources SET status = ? WHERE resource_id = ?',
      ['available', transaction.resource_id]
    );
    
    res.json({ message: 'Resource returned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;