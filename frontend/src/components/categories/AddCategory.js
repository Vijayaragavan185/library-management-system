// src/components/categories/AddCategory.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AddCategory = ({ onCategoryAdded }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_category_id: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/categories', formData);
      setSuccess('Category added successfully!');
      setFormData({
        name: '',
        description: '',
        parent_category_id: ''
      });
      if (onCategoryAdded) onCategoryAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-category-form">
      <h2>Add New Category</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Category Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Fiction, Science, Technology"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Brief description of this category"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="parent_category_id">Parent Category (Optional)</label>
          <select
            id="parent_category_id"
            name="parent_category_id"
            value={formData.parent_category_id}
            onChange={handleChange}
          >
            <option value="">-- No Parent (Top Level) --</option>
            {categories.map(category => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Category'}
        </button>
      </form>
    </div>
  );
};

export default AddCategory;