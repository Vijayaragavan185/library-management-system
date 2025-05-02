// const express = require('express');
// const router = express.Router();
// const pool = require('../config/db');

// // Get all resources
// router.get('/', async (req, res) => {
//   try {
//     const [resources] = await pool.query('SELECT * FROM resources');
//     res.json(resources);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get resource by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const [resources] = await pool.query(
//       'SELECT * FROM resources WHERE resource_id = ?',
//       [req.params.id]
//     );
    
//     if (resources.length === 0) {
//       return res.status(404).json({ message: 'Resource not found' });
//     }
    
//     res.json(resources[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Add new resource
// router.post('/', async (req, res) => {
//   try {
//     const { resource_id, title, type, location_code } = req.body;
    
//     await pool.query(
//       'INSERT INTO resources (resource_id, title, type, location_code, status) VALUES (?, ?, ?, ?, ?)',
//       [resource_id, title, type, location_code, 'available']
//     );
    
//     res.status(201).json({ message: 'Resource added successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update in routes/resources.js - modify the existing POST route

// // Add new resource
// router.post('/', async (req, res) => {
//     try {
//       const { resource_id, title, type, location_code, category_id } = req.body;
      
//       await pool.query(
//         'INSERT INTO resources (resource_id, title, type, location_code, status, category_id) VALUES (?, ?, ?, ?, ?, ?)',
//         [resource_id, title, type, location_code, 'available', category_id || null]
//       );
      
//       res.status(201).json({ message: 'Resource added successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
  
//   // Get all resources (update to include category info)
//   router.get('/', async (req, res) => {
//     try {
//       const [resources] = await pool.query(`
//         SELECT r.*, c.name as category_name 
//         FROM resources r
//         LEFT JOIN resource_categories c ON r.category_id = c.category_id
//       `);
//       res.json(resources);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });

// module.exports = router;
// backend/routes/resources.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all resources
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
    const { resource_id, title, type, location_code, category_id } = req.body;
    
    await pool.query(
      'INSERT INTO resources (resource_id, title, type, location_code, category_id) VALUES (?, ?, ?, ?, ?)',
      [resource_id, title, type, location_code, category_id || null]
    );
    
    // If additional details are provided based on type, insert them
    if (type === 'book' && req.body.isbn) {
      await pool.query(
        'INSERT INTO books (resource_id, isbn, author, publisher, publication_year) VALUES (?, ?, ?, ?, ?)',
        [resource_id, req.body.isbn, req.body.author || 'Unknown', req.body.publisher, req.body.publication_year]
      );
    } else if (type === 'journal' && req.body.issn) {
      await pool.query(
        'INSERT INTO journals (resource_id, issn, volume, issue, publication_date) VALUES (?, ?, ?, ?, ?)',
        [resource_id, req.body.issn, req.body.volume, req.body.issue, req.body.publication_date]
      );
    } else if (type === 'equipment' && req.body.manufacturer) {
      await pool.query(
        'INSERT INTO equipment (resource_id, manufacturer, model, serial_number, purchase_date) VALUES (?, ?, ?, ?, ?)',
        [resource_id, req.body.manufacturer, req.body.model, req.body.serial_number, req.body.purchase_date]
      );
    }
    
    res.status(201).json({ message: 'Resource added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get resource with type-specific details
router.get('/:id/details', async (req, res) => {
  try {
    const [resources] = await pool.query(
      'SELECT * FROM resources WHERE resource_id = ?',
      [req.params.id]
    );
    
    if (resources.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    const resource = resources[0];
    let details = {};
    
    // Get type-specific details
    if (resource.type === 'book') {
      const [books] = await pool.query(
        'SELECT * FROM books WHERE resource_id = ?',
        [req.params.id]
      );
      if (books.length > 0) {
        details = books[0];
      }
    } else if (resource.type === 'journal') {
      const [journals] = await pool.query(
        'SELECT * FROM journals WHERE resource_id = ?',
        [req.params.id]
      );
      if (journals.length > 0) {
        details = journals[0];
      }
    } else if (resource.type === 'equipment') {
      const [equipment] = await pool.query(
        'SELECT * FROM equipment WHERE resource_id = ?',
        [req.params.id]
      );
      if (equipment.length > 0) {
        details = equipment[0];
      }
    }
    
    res.json({
      ...resource,
      details
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update resource
router.put('/:id', async (req, res) => {
  try {
    const { title, type, location_code, category_id } = req.body;
    
    await pool.query(
      'UPDATE resources SET title = ?, type = ?, location_code = ?, category_id = ? WHERE resource_id = ?',
      [title, type, location_code, category_id || null, req.params.id]
    );
    
    res.json({ message: 'Resource updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
