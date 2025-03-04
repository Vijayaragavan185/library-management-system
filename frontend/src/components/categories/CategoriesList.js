// src/components/categories/CategoriesList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CategoriesList = ({ onRefresh }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/categories');
        setCategories(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch categories data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [onRefresh]);

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="categories-list">
      <h2>Resource Categories</h2>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category Name</th>
            <th>Parent Category</th>
            <th>Resources</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-data">No categories found. Add your first category!</td>
            </tr>
          ) : (
            categories.map(category => (
              <tr key={category.category_id}>
                <td>{category.category_id}</td>
                <td>{category.name}</td>
                <td>{category.parent_name || '-'}</td>
                <td>{category.resource_count}</td>
                <td className="actions">
                  <button className="btn-edit">Edit</button>
                  <button 
                    className="btn-delete"
                    disabled={category.resource_count > 0}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesList;