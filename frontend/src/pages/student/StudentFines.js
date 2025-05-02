// src/pages/student/StudentFines.js
import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import api from '../../services/api';
import AuthService from '../../services/auth.service';

const StudentFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const currentUser = AuthService.getCurrentUser();

  const fetchFines = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/fines/student/${currentUser.student_id}`);
      setFines(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load your fines');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [currentUser.student_id]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Calculate total unpaid fines
  const totalUnpaidFines = fines
    .filter(fine => fine.status === 'pending')
    .reduce((total, fine) => total + parseFloat(fine.amount), 0)
    .toFixed(2);

  const handlePayFine = async (fineId) => {
    try {
      setPaymentLoading(true);
      setPaymentSuccess(null);
      
      await api.patch(`/fines/${fineId}/pay`);
      setPaymentSuccess(`Payment successful! Fine #${fineId} has been marked as paid.`);
      
      // Refresh fines data
      fetchFines();
    } catch (err) {
      setError('Failed to process payment. Please try again or contact the library.');
      console.error(err);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <StudentLayout><div>Loading your fines...</div></StudentLayout>;
  if (error) return <StudentLayout><div className="error-message">{error}</div></StudentLayout>;

  return (
    <StudentLayout>
      <div className="student-fines">
        <h1>My Fines</h1>
        
        <div className="fines-summary">
          <div className="summary-card">
            <h3>Total Unpaid Fines</h3>
            <p className="amount">${totalUnpaidFines}</p>
          </div>
        </div>
        
        {paymentSuccess && <div className="success-message">{paymentSuccess}</div>}
        
        {fines.length === 0 ? (
          <p className="no-fines">You don't have any fines.</p>
        ) : (
          <div className="fines-list">
            <h2>Fines Detail</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Resource</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fines.map(fine => (
                  <tr key={fine.fine_id}>
                    <td>{fine.fine_id}</td>
                    <td>{fine.resource_title}</td>
                    <td>{formatCurrency(fine.amount)}</td>
                    <td className="capitalize">{fine.reason}</td>
                    <td>{formatDate(fine.issue_date)}</td>
                    <td>
                      <span className={`status-badge ${fine.status}`}>
                        {fine.status}
                      </span>
                    </td>
                    <td>
                      {fine.status === 'pending' && (
                        <button 
                          className="btn-pay"
                          onClick={() => handlePayFine(fine.fine_id)}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? 'Processing...' : 'Pay Fine'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="fines-info">
          <h3>About Library Fines</h3>
          <p>Fines are charged for overdue returns, damaged materials, or lost items. If you believe there's an error with your fines, please contact the library staff.</p>
          <p>Payment methods accepted: Credit/debit cards, cash at the circulation desk, or through your student account.</p>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentFines;
