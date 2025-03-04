const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all resources
router.get('/', async (req, res) => {
  try {
    const [resources] = await pool.query('SELECT * FROM resources');
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const [resources] = await pool.query(
      'SELECT * FROM resources WHERE resource_id = ?',
      [req.params.id]
    );
    
    if (resources.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resources[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new resource
router.post('/', async (req, res) => {
  try {
    const { resource_id, title, type, location_code } = req.body;
    
    await pool.query(
      'INSERT INTO resources (resource_id, title, type, location_code, status) VALUES (?, ?, ?, ?, ?)',
      [resource_id, title, type, location_code, 'available']
    );
    
    res.status(201).json({ message: 'Resource added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update in routes/resources.js - modify the existing POST route

// Add new resource
router.post('/', async (req, res) => {
    try {
      const { resource_id, title, type, location_code, category_id } = req.body;
      
      await pool.query(
        'INSERT INTO resources (resource_id, title, type, location_code, status, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [resource_id, title, type, location_code, 'available', category_id || null]
      );
      
      res.status(201).json({ message: 'Resource added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get all resources (update to include category info)
  router.get('/', async (req, res) => {
    try {
      const [resources] = await pool.query(`
        SELECT r.*, c.name as category_name 
        FROM resources r
        LEFT JOIN resource_categories c ON r.category_id = c.category_id
      `);
      res.json(resources);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;