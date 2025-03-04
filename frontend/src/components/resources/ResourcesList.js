// src/components/resources/ResourcesList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ResourcesList = ({ onRefresh }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await api.get('/resources');
        setResources(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch resources data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [onRefresh]);

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
                  <button className="btn-view">View</button>
                  <button className="btn-edit">Edit</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResourcesList;