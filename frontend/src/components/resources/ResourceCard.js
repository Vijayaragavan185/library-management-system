// src/components/resources/ResourceCard.js
import React, { useState } from 'react';
import api from '../../services/api';
import AuthService from '../../services/auth.service';

const ResourceCard = ({ resource, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const currentUser = AuthService.getCurrentUser();

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await api.post('/transactions/checkout', {
        student_id: currentUser.student_id,
        resource_id: resource.resource_id,
        due_days: 14 // Default due days
      });
      
      setSuccess(`Successfully checked out ${resource.title}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to checkout resource');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resource-card">
      <div className="resource-type-badge">{resource.type}</div>
      <h3 className="resource-title">{resource.title}</h3>
      <div className="resource-meta">
        <p>ID: {resource.resource_id}</p>
        <p>Location: {resource.location_code}</p>
      </div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <button 
        className="checkout-button"
        onClick={handleCheckout}
        disabled={loading || resource.status !== 'available'}
      >
        {loading ? 'Processing...' : 
         resource.status === 'available' ? 'Check Out' : 'Unavailable'}
      </button>
    </div>
  );
};

export default ResourceCard;
