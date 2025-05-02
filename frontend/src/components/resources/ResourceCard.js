// src/components/resources/ResourceCard.js - modified version
import React, { useState } from 'react';
import api from '../../services/api';
import AuthService from '../../services/auth.service';

const ResourceCard = ({ resource, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dueDays, setDueDays] = useState(14);
  const currentUser = AuthService.getCurrentUser();

  const openConfirmation = () => {
    setShowConfirmation(true);
    setError(null);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await api.post('/transactions/checkout', {
        student_id: currentUser.student_id,
        resource_id: resource.resource_id,
        due_days: dueDays
      });
      
      setSuccess(`Successfully checked out ${resource.title}`);
      setShowConfirmation(false);
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
      
      {!showConfirmation ? (
        <button 
          className="checkout-button"
          onClick={openConfirmation}
          disabled={loading || resource.status !== 'available'}
        >
          {loading ? 'Processing...' : 
          resource.status === 'available' ? 'Check Out' : 'Unavailable'}
        </button>
      ) : (
        <div className="checkout-confirmation">
          <p>Confirm checkout of "{resource.title}"?</p>
          <div className="due-days-selector">
            <label>Return in: </label>
            <select 
              value={dueDays} 
              onChange={(e) => setDueDays(parseInt(e.target.value))}
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          <div className="confirmation-buttons">
            <button 
              className="confirm-button"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
            <button 
              className="cancel-button"
              onClick={closeConfirmation}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceCard;
