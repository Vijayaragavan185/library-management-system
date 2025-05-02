// src/pages/student/BrowseResources.js
import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import ResourceCard from '../../components/resources/ResourceCard'; // Import ResourceCard
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
  const [refreshTrigger, setRefreshTrigger] = useState(false); // Add refresh trigger

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
  }, [refreshTrigger]); // Add refreshTrigger as dependency

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

  // Handle refresh after checkout
  const handleRefresh = () => {
    setRefreshTrigger(prev => !prev);
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
              <ResourceCard 
                key={resource.resource_id} 
                resource={resource} 
                onRefresh={handleRefresh}
              />
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default BrowseResources;
