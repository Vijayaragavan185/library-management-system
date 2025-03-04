// src/components/resources/AddResource.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AddResource = ({ onResourceAdded }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    resource_id: '',
    title: '',
    type: 'book',
    location_code: '',
    category_id: ''
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
      await api.post('/resources', formData);
      setSuccess('Resource added successfully!');
      setFormData({
        resource_id: '',
        title: '',
        type: 'book',
        location_code: '',
        category_id: ''
      });
      if (onResourceAdded) onResourceAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add resource');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-resource-form">
      <h2>Add New Resource</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="resource_id">Resource ID</label>
          <input
            type="text"
            id="resource_id"
            name="resource_id"
            value={formData.resource_id}
            onChange={handleChange}
            required
            placeholder="e.g., B001, DVD034"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Resource title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="book">Book</option>
            <option value="journal">Journal</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="location_code">Location Code</label>
          <input
            type="text"
            id="location_code"
            name="location_code"
            value={formData.location_code}
            onChange={handleChange}
            required
            placeholder="e.g., S-12-B, D-05-A"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category_id">Category (Optional)</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
          >
            <option value="">-- Select Category --</option>
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
          {loading ? 'Adding...' : 'Add Resource'}
        </button>
      </form>
    </div>
  );
};

export default AddResource;