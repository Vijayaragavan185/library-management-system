// src/pages/student/BrowseResources.js
import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import api from '../../services/api';

const BrowseResources = () => {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    type: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resourcesRes, categoriesRes] = await Promise.all([
          api.get('/resources'),
          api.get('/categories')
        ]);
        
        setResources(resourcesRes.data);
        setCategories(categoriesRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to load resources');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      type: ''
    });
  };

  // Filter resources based on user-selected filters
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesCategory = filters.category === '' || resource.category_id === parseInt(filters.category);
    const matchesType = filters.type === '' || resource.type === filters.type;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  if (loading) return <StudentLayout><div>Loading resources...</div></StudentLayout>;
  if (error) return <StudentLayout><div className="error-message">{error}</div></StudentLayout>;

  return (
    <StudentLayout>
      <div className="browse-resources">
        <h1>Browse Library Resources</h1>
        
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Search by title..."
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="book">Books</option>
              <option value="journal">Journals</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
          
          <button onClick={resetFilters} className="btn-reset">
            Reset Filters
          </button>
        </div>
        
        <div className="resources-grid">
          {filteredResources.length === 0 ? (
            <p className="no-results">No resources found matching your filters.</p>
          ) : (
            filteredResources.map(resource => (
              <div key={resource.resource_id} className="resource-card">
                <div className="resource-type-badge">{resource.type}</div>
                <h3>{resource.title}</h3>
                <p className="resource-id">ID: {resource.resource_id}</p>
                <p className="resource-location">Location: {resource.location_code}</p>
                <div className="resource-footer">
                  <span className={`status-badge ${resource.status}`}>
                    {resource.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default BrowseResources;