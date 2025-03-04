// src/components/circulation/CheckoutForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CheckoutForm = ({ onCheckout }) => {
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    student_id: '',
    resource_id: '',
    due_days: 14
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, resourcesRes] = await Promise.all([
          api.get('/students'),
          api.get('/resources')
        ]);
        
        setStudents(studentsRes.data);
        // Filter only available resources
        setResources(resourcesRes.data.filter(r => r.status === 'available'));
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
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
    setIsSubmitting(true);

    try {
      await api.post('/transactions/checkout', formData);
      setSuccess('Resource checked out successfully!');
      setFormData({
        student_id: '',
        resource_id: '',
        due_days: 14
      });
      if (onCheckout) onCheckout();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="checkout-form">
      <h2>Check Out Resource</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="student_id">Select Student</label>
          <select
            id="student_id"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Student --</option>
            {students.map(student => (
              <option key={student.student_id} value={student.student_id}>
                {student.student_id} - {student.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="resource_id">Select Resource</label>
          <select
            id="resource_id"
            name="resource_id"
            value={formData.resource_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Resource --</option>
            {resources.length === 0 ? (
              <option value="" disabled>No available resources</option>
            ) : (
              resources.map(resource => (
                <option key={resource.resource_id} value={resource.resource_id}>
                  {resource.resource_id} - {resource.title}
                </option>
              ))
            )}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="due_days">Due in (days)</label>
          <select
            id="due_days"
            name="due_days"
            value={formData.due_days}
            onChange={handleChange}
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="btn-submit"
          disabled={isSubmitting || resources.length === 0}
        >
          {isSubmitting ? 'Processing...' : 'Check Out'}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;