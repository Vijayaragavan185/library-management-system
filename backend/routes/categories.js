// // backend/routes/categories.js
// const express = require('express');
// const router = express.Router();
// const pool = require('../config/db');

// // Get all categories
// router.get('/', async (req, res) => {
//   try {
//     const [categories] = await pool.query(`
//       SELECT c.*, 
//         (SELECT COUNT(*) FROM resources WHERE category_id = c.category_id) as resource_count,
//         p.name as parent_name
//       FROM resource_categories c
//       LEFT JOIN resource_categories p ON c.parent_category_id = p.category_id
//     `);
//     res.json(categories);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get category by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const [categories] = await pool.query(
//       'SELECT * FROM resource_categories WHERE category_id = ?',
//       [req.params.id]
//     );
    
//     if (categories.length === 0) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
    
//     res.json(categories[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create new category
// router.post('/', async (req, res) => {
//   try {
//     const { name, description, parent_category_id } = req.body;
    
//     const result = await pool.query(
//       'INSERT INTO resource_categories (name, description, parent_category_id) VALUES (?, ?, ?)',
//       [name, description, parent_category_id || null]
//     );
    
//     res.status(201).json({ 
//       message: 'Category created successfully',
//       category_id: result[0].insertId
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update category
// router.put('/:id', async (req, res) => {
//   try {
//     const { name, description, parent_category_id } = req.body;
    
//     await pool.query(
//       'UPDATE resource_categories SET name = ?, description = ?, parent_category_id = ? WHERE category_id = ?',
//       [name, description, parent_category_id || null, req.params.id]
//     );
    
//     res.json({ message: 'Category updated successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Delete category (with validation to prevent orphaned resources)
// router.delete('/:id', async (req, res) => {
//   try {
//     // Check if any resources use this category
//     const [resources] = await pool.query(
//       'SELECT COUNT(*) as count FROM resources WHERE category_id = ?',
//       [req.params.id]
//     );
    
//     if (resources[0].count > 0) {
//       return res.status(400).json({ 
//         message: 'Cannot delete category with associated resources' 
//       });
//     }
    
//     // Check if any subcategories use this as parent
//     const [subcategories] = await pool.query(
//       'SELECT COUNT(*) as count FROM resource_categories WHERE parent_category_id = ?',
//       [req.params.id]
//     );
    
//     if (subcategories[0].count > 0) {
//       return res.status(400).json({ 
//         message: 'Cannot delete category with subcategories' 
//       });
//     }
    
//     await pool.query(
//       'DELETE FROM resource_categories WHERE category_id = ?',
//       [req.params.id]
//     );
    
//     res.json({ message: 'Category deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
// backend/routes/categories.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM resources WHERE category_id = c.category_id) as resource_count,
        p.name as parent_name
      FROM resource_categories c
      LEFT JOIN resource_categories p ON c.parent_category_id = p.category_id
    `);
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM resource_categories WHERE category_id = ?',
      [req.params.id]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(categories[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const { name, description, parent_category_id } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO resource_categories (name, description, parent_category_id) VALUES (?, ?, ?)',
      [name, description, parent_category_id || null]
    );
    
    res.status(201).json({ 
      message: 'Category created successfully',
      category_id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, parent_category_id } = req.body;
    
    await pool.query(
      'UPDATE resource_categories SET name = ?, description = ?, parent_category_id = ? WHERE category_id = ?',
      [name, description, parent_category_id || null, req.params.id]
    );
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category (with validation to prevent orphaned resources)
router.delete('/:id', async (req, res) => {
  try {
    // Check if any resources use this category
    const [resources] = await pool.query(
      'SELECT COUNT(*) as count FROM resources WHERE category_id = ?',
      [req.params.id]
    );
    
    if (resources[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with associated resources' 
      });
    }
    
    // Check if any subcategories use this as parent
    const [subcategories] = await pool.query(
      'SELECT COUNT(*) as count FROM resource_categories WHERE parent_category_id = ?',
      [req.params.id]
    );
    
    if (subcategories[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories' 
      });
    }
    
    await pool.query(
      'DELETE FROM resource_categories WHERE category_id = ?',
      [req.params.id]
    );
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
