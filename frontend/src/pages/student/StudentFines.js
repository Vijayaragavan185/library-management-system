// src/pages/student/StudentFines.js
import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import api from '../../services/api';
import AuthService from '../../services/auth.service';

const StudentFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    const fetchFines = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/fines/student/${currentUser.student_id}`);
        setFines(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch your fines');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

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

  // Calculate total fine amount
  const totalPendingFines = fines
    .filter(fine => fine.status === 'pending')
    .reduce((total, fine) => total + parseFloat(fine.amount), 0)
    .toFixed(2);

  if (loading) return <StudentLayout><div>Loading your fines...</div></StudentLayout>;
  if (error) return <StudentLayout><div className="error-message">{error}</div></StudentLayout>;

  return (
    <StudentLayout>
      <div className="student-fines">
        <h1>Your Fines</h1>
        
        {fines.length === 0 ? (
          <div className="no-fines-message">
            <p>You don't have any fines. Keep up the good work!</p>
          </div>
        ) : (
          <>
            <div className="fines-summary">
              <h3>Total Pending: <span className="total-amount">${totalPendingFines}</span></h3>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fines.map(fine => (
                  <tr key={fine.fine_id}>
                    <td>{fine.resource_title}</td>
                    <td>{formatCurrency(fine.amount)}</td>
                    <td className="capitalize">{fine.reason}</td>
                    <td>{formatDate(fine.issue_date)}</td>
                    <td>
                      <span className={`status-badge ${fine.status}`}>
                        {fine.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="payment-notice">
              <h3>How to Pay</h3>
              <p>Please visit the library front desk to pay any pending fines. We accept cash, credit cards, and student account transfers.</p>
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentFines;