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
// router.post('/checkout', async (req, res) => {
//   try {
//     const { student_id, resource_id, due_days = 14 } = req.body;
    
//     const result = await withTransaction(async (connection) => {
//       // Check if resource is available (with FOR UPDATE to lock the row)
//       const [resources] = await connection.query(
//         'SELECT * FROM resources WHERE resource_id = ? AND status = ? FOR UPDATE',
//         [resource_id, 'available']
//       );
      
//       if (resources.length === 0) {
//         throw new Error('Resource is not available');
//       }
      
//       // Create transaction
//       const dueDate = new Date();
//       dueDate.setDate(dueDate.getDate() + due_days);
      
//       // Insert transaction record and get the ID
//       const [transactionResult] = await connection.query(
//         'INSERT INTO transactions (due_time) VALUES (?)',
//         [dueDate]
//       );
      
//       const transaction_id = transactionResult.insertId;
      
//       // Create mapping entry
//       await connection.query(
//         'INSERT INTO transaction_mapping (student_id, resource_id, checkout_time, transaction_id) VALUES (?, ?, NOW(), ?)',
//         [student_id, resource_id, transaction_id]
//       );
      
//       // Update resource status
//       await connection.query(
//         'UPDATE resources SET status = ? WHERE resource_id = ?',
//         ['borrowed', resource_id]
//       );
      
//       return { transaction_id };
//     });
    
//     res.status(201).json({ 
//       message: 'Resource checked out successfully',
//       transaction_id: result.transaction_id
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(error.message === 'Resource is not available' ? 400 : 500)
//       .json({ message: error.message || 'Server error' });
//   }
// });
// Backend routes/transactions.js - Update the checkout route
router.post('/checkout', async (req, res) => {
  try {
    const { student_id, resource_id, due_days = 14 } = req.body;
    
    // Validation
    if (!student_id || !resource_id) {
      return res.status(400).json({ message: 'Student ID and Resource ID are required' });
    }
    
    // Check if student exists and is active
    const [students] = await pool.query(
      'SELECT * FROM students WHERE student_id = ? AND status = ?',
      [student_id, 'active']
    );
    
    if (students.length === 0) {
      return res.status(400).json({ message: 'Student not found or not active' });
    }
    
    // Check if resource already checked out
    const [activeCheckouts] = await pool.query(`
      SELECT t.transaction_id 
      FROM transactions t
      JOIN transaction_mapping tm ON t.transaction_id = tm.transaction_id
      WHERE tm.resource_id = ? AND t.return_time IS NULL
    `, [resource_id]);
    
    if (activeCheckouts.length > 0) {
      return res.status(400).json({ message: 'Resource is already checked out' });
    }
    
    // Process checkout with transaction
    const result = await withTransaction(async (connection) => {
      // Create transaction record
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(due_days));
      
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
      
      return { transaction_id };
    });
    
    res.status(201).json({
      message: 'Resource checked out successfully',
      transaction_id: result.transaction_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});



// Return a resource
// Update in backend/routes/transactions.js
// backend/routes/transactions.js (update the return route)
router.post('/return', async (req, res) => {
  try {
    const { transaction_id } = req.body;
    
    await withTransaction(async (connection) => {
      // Lock the transaction row and get resource_id from transaction_mapping
      const [transactions] = await connection.query(`
        SELECT t.transaction_id, t.due_time, tm.resource_id, tm.student_id, r.type 
        FROM transactions t
        JOIN transaction_mapping tm ON t.transaction_id = tm.transaction_id
        JOIN resources r ON tm.resource_id = r.resource_id
        WHERE t.transaction_id = ? AND t.return_time IS NULL FOR UPDATE`,
        [transaction_id]
      );
      
      if (transactions.length === 0) {
        throw new Error('Transaction not found or resource already returned');
      }
      
      const transaction = transactions[0];
      
      // Update transaction with return time
      const now = new Date();
      await connection.query(
        'UPDATE transactions SET return_time = ? WHERE transaction_id = ?',
        [now, transaction_id]
      );
      
      // Update resource status
      await connection.query(
        'UPDATE resources SET status = ? WHERE resource_id = ?',
        ['available', transaction.resource_id]
      );
      
      // Check if overdue and calculate fine
      const dueTime = new Date(transaction.due_time);
      if (now > dueTime) {
        // Calculate days overdue
        const daysOverdue = Math.ceil((now - dueTime) / (1000 * 60 * 60 * 24));
        
        // Get fine rate for this resource type
        const [rateInfo] = await connection.query(
          'SELECT rate_id, daily_rate FROM fine_rates WHERE resource_type = ? ORDER BY effective_date DESC LIMIT 1',
          [transaction.type]
        );
        
        if (rateInfo.length > 0) {
          const dailyRate = rateInfo[0].daily_rate;
          const fineAmount = daysOverdue * dailyRate;
          
          // Create fine record
          await connection.query(
            'INSERT INTO fines (transaction_id, amount, reason, status, issue_date, rate_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              transaction_id, 
              fineAmount, 
              'overdue', 
              'pending', 
              now, 
              rateInfo[0].rate_id,
              `Returned ${daysOverdue} days late`
            ]
          );
          
          return { fineCreated: true, amount: fineAmount, daysOverdue };
        }
      }
      
      return { fineCreated: false };
    });
    
    res.status(200).json({ message: 'Resource returned successfully' });
  } catch (error) {
    console.error(error);
    res.status(error.message.includes('not found') ? 404 : 500)
      .json({ message: error.message || 'Server error' });
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