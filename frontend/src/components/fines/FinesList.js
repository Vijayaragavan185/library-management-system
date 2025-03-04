// src/components/fines/FinesList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FinesList = ({ refreshTrigger }) => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        setLoading(true);
        const response = await api.get('/fines');
        setFines(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch fines data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, [refreshTrigger]);

  const handlePayFine = async (fineId) => {
    try {
      await api.patch(`/fines/${fineId}/pay`);
      // Refresh the list
      const response = await api.get('/fines');
      setFines(response.data);
    } catch (err) {
      console.error('Failed to pay fine', err);
    }
  };

  const handleWaiveFine = async (fineId) => {
    try {
      await api.patch(`/fines/${fineId}/waive`);
      // Refresh the list
      const response = await api.get('/fines');
      setFines(response.data);
    } catch (err) {
      console.error('Failed to waive fine', err);
    }
  };

  if (loading) return <div>Loading fines...</div>;
  if (error) return <div className="error-message">{error}</div>;

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="fines-list">
      <h2>Student Fines</h2>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Resource</th>
            <th>Amount</th>
            <th>Reason</th>
            <th>Issue Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fines.length === 0 ? (
            <tr>
              <td colSpan="8" className="no-data">No fines found</td>
            </tr>
          ) : (
            fines.map(fine => (
              <tr key={fine.fine_id}>
                <td>{fine.fine_id}</td>
                <td>{fine.student_name}</td>
                <td>{fine.resource_title}</td>
                <td>{formatCurrency(fine.amount)}</td>
                <td className="capitalize">{fine.reason}</td>
                <td>{formatDate(fine.issue_date)}</td>
                <td>
                  <span className={`status-badge ${fine.status}`}>
                    {fine.status}
                  </span>
                </td>
                <td className="actions">
                  {fine.status === 'pending' && (
                    <>
                      <button 
                        className="btn-success"
                        onClick={() => handlePayFine(fine.fine_id)}
                      >
                        Pay
                      </button>
                      <button 
                        className="btn-warning"
                        onClick={() => handleWaiveFine(fine.fine_id)}
                      >
                        Waive
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FinesList;