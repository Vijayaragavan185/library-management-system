const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const [transactions] = await pool.query(`
      SELECT t.transaction_id, t.due_time, t.return_time, 
             tm.checkout_time, tm.student_id, tm.resource_id,
             s.name as student_name, r.title as resource_title
      FROM transactions t
      JOIN transaction_mapping tm ON t.transaction_id = tm.transaction_id
      JOIN students s ON tm.student_id = s.student_id
      JOIN resources r ON tm.resource_id = r.resource_id
    `);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check out a resource
// router.post('/checkout', async (req, res) => {
//   try {
//     const { student_id, resource_id, due_days = 14 } = req.body;
    
//     // Check if resource is available
//     const [resources] = await pool.query(
//       'SELECT * FROM resources WHERE resource_id = ? AND status = ?',
//       [resource_id, 'available']
//     );
    
//     if (resources.length === 0) {
//       return res.status(400).json({ message: 'Resource is not available' });
//     }
    
//     // Create transaction
//     const dueDate = new Date();
//     dueDate.setDate(dueDate.getDate() + due_days);
    
//     await pool.query(
//       'INSERT INTO transactions (student_id, resource_id, checkout_time, due_time) VALUES (?, ?, NOW(), ?)',
//       [student_id, resource_id, dueDate]
//     );
    
//     // Update resource status
//     await pool.query(
//       'UPDATE resources SET status = ? WHERE resource_id = ?',
//       ['borrowed', resource_id]
//     );
    
//     res.status(201).json({ message: 'Resource checked out successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
const { withTransaction } = require('../utils/transactionHelper');

// Check out a resource
router.post('/checkout', async (req, res) => {
  try {
    const { student_id, resource_id, due_days = 14 } = req.body;
    
    const result = await withTransaction(async (connection) => {
      // Check if resource is available (with FOR UPDATE to lock the row)
      const [resources] = await connection.query(
        'SELECT * FROM resources WHERE resource_id = ? AND status = ? FOR UPDATE',
        [resource_id, 'available']
      );
      
      if (resources.length === 0) {
        throw new Error('Resource is not available');
      }
      
      // Create transaction
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + due_days);
      
      // Insert transaction record and get the ID
      const [transactionResult] = await connection.query(
        'INSERT INTO transactions (due_time) VALUES (?)',
        [dueDate]
      );
      
      const transaction_id = transactionResult.insertId;
      
      // Create mapping entry
      await connection.query(
        'INSERT INTO transaction_mapping (student_id, resource_id, checkout_time, transaction_id) VALUES (?, ?, NOW(), ?)',
        [student_id, resource_id, transaction_id]
      );
      
      // Update resource status
      await connection.query(
        'UPDATE resources SET status = ? WHERE resource_id = ?',
        ['borrowed', resource_id]
      );
      
      return { transaction_id };
    });
    
    res.status(201).json({ 
      message: 'Resource checked out successfully',
      transaction_id: result.transaction_id
    });
  } catch (error) {
    console.error(error);
    res.status(error.message === 'Resource is not available' ? 400 : 500)
      .json({ message: error.message || 'Server error' });
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

router.get('/student/:id', async (req, res) => {
  try {
    const [transactions] = await pool.query(`
      SELECT t.transaction_id, t.due_time, t.return_time, 
             tm.checkout_time, r.title as resource_title, r.resource_id
      FROM transactions t
      JOIN transaction_mapping tm ON t.transaction_id = tm.transaction_id
      JOIN resources r ON tm.resource_id = r.resource_id
      WHERE tm.student_id = ?
      ORDER BY tm.checkout_time DESC
    `, [req.params.id]);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;