// src/components/resources/ResourcesList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ResourcesList = ({ onRefresh }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    type: '',
    location_code: '',
    category_id: ''
  });
  const [categories, setCategories] = useState([]);

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
        setError('Failed to fetch resources data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onRefresh]);

  const handleView = (resource) => {
    setSelectedResource(resource);
    setViewModalOpen(true);
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setEditForm({
      title: resource.title,
      type: resource.type,
      location_code: resource.location_code,
      category_id: resource.category_id || ''
    });
    setEditModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedResource(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedResource(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/resources/${selectedResource.resource_id}`, editForm);
      
      // Refresh the resources list
      const response = await api.get('/resources');
      setResources(response.data);
      
      // Close the modal
      handleCloseEditModal();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update resource:', err);
    }
  };

  if (loading) return <div>Loading resources...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="resources-list">
      <h2>Library Resources</h2>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {resources.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-data">No resources found. Add your first resource!</td>
            </tr>
          ) : (
            resources.map(resource => (
              <tr key={resource.resource_id}>
                <td>{resource.resource_id}</td>
                <td>{resource.title}</td>
                <td>{resource.type}</td>
                <td>{resource.location_code}</td>
                <td>
                  <span className={`status-badge ${resource.status}`}>
                    {resource.status}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="btn-view"
                    onClick={() => handleView(resource)}
                  >
                    View
                  </button>
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(resource)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* View Resource Modal */}
      {viewModalOpen && selectedResource && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseViewModal}>&times;</span>
            <h2>Resource Details</h2>
            <div className="resource-details">
              <p><strong>ID:</strong> {selectedResource.resource_id}</p>
              <p><strong>Title:</strong> {selectedResource.title}</p>
              <p><strong>Type:</strong> {selectedResource.type}</p>
              <p><strong>Location:</strong> {selectedResource.location_code}</p>
              <p><strong>Status:</strong> {selectedResource.status}</p>
              <p><strong>Category:</strong> {selectedResource.category_name || 'Uncategorized'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {editModalOpen && selectedResource && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseEditModal}>&times;</span>
            <h2>Edit Resource</h2>
            <div className="edit-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={editForm.type}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="book">Book</option>
                  <option value="journal">Journal</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location Code</label>
                <input
                  type="text"
                  name="location_code"
                  value={editForm.location_code}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category_id"
                  value={editForm.category_id}
                  onChange={handleEditFormChange}
                >
                  <option value="">-- No Category --</option>
                  {categories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button 
                  className="btn-save"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
                <button 
                  className="btn-cancel"
                  onClick={handleCloseEditModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesList;
