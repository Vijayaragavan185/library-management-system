// src/components/circulation/ReturnForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ReturnForm = ({ onReturn }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/transactions');
        // Filter only checked out transactions (where return_time is null)
        const activeTransactions = response.data.filter(t => t.return_time === null);
        setTransactions(activeTransactions);
        setLoading(false);
      } catch (err) {
        setError('Failed to load transactions');
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    setSelectedTransaction(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTransaction) return;
    
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await api.post('/transactions/return', { transaction_id: selectedTransaction });
      setSuccess('Resource returned successfully!');
      setSelectedTransaction('');
      if (onReturn) onReturn();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="return-form">
      <h2>Return Resource</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="transaction_id">Select Transaction</label>
          <select
            id="transaction_id"
            name="transaction_id"
            value={selectedTransaction}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Transaction --</option>
            {transactions.length === 0 ? (
              <option value="" disabled>No active checkouts</option>
            ) : (
              transactions.map(transaction => (
                <option key={transaction.transaction_id} value={transaction.transaction_id}>
                  {transaction.student_name} - {transaction.resource_title}
                </option>
              ))
            )}
          </select>
        </div>
        
        <button 
          type="submit" 
          className="btn-submit"
          disabled={isSubmitting || transactions.length === 0 || !selectedTransaction}
        >
          {isSubmitting ? 'Processing...' : 'Return Resource'}
        </button>
      </form>
    </div>
  );
};

export default ReturnForm;