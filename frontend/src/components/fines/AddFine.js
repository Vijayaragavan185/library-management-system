// src/components/fines/AddFine.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AddFine = ({ onFineAdded }) => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    transaction_id: '',
    amount: '',
    reason: 'overdue',
    notes: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/transactions');
        setTransactions(response.data);
      } catch (err) {
        console.error('Failed to load transactions', err);
      }
    };

    fetchTransactions();
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
      await api.post('/fines', formData);
      setSuccess('Fine added successfully!');
      setFormData({
        transaction_id: '',
        amount: '',
        reason: 'overdue',
        notes: ''
      });
      if (onFineAdded) onFineAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add fine');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-fine-form">
      <h2>Add New Fine</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="transaction_id">Select Transaction</label>
          <select
            id="transaction_id"
            name="transaction_id"
            value={formData.transaction_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Transaction --</option>
            {transactions.map(transaction => (
              <option key={transaction.transaction_id} value={transaction.transaction_id}>
                {transaction.student_name} - {transaction.resource_title}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Fine Amount ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="reason">Reason</label>
          <select
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
          >
            <option value="overdue">Overdue</option>
            <option value="damage">Damage</option>
            <option value="loss">Loss</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Additional details about this fine"
          />
        </div>
        
        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Fine'}
        </button>
      </form>
    </div>
  );
};

export default AddFine;