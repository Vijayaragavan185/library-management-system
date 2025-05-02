// src/pages/student/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import api from '../../services/api';
import AuthService from '../../services/auth.service';

const StudentDashboard = () => {
  const [checkouts, setCheckouts] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returningId, setReturningId] = useState(null);
  const currentUser = AuthService.getCurrentUser();

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [checkoutsRes, finesRes] = await Promise.all([
        api.get(`/transactions/student/${currentUser.student_id}`),
        api.get(`/fines/student/${currentUser.student_id}`)
      ]);
      
      setCheckouts(checkoutsRes.data);
      setFines(finesRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load your data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [currentUser.student_id]);

  // Handle return functionality
  const handleReturn = async (transactionId) => {
    try {
      setReturningId(transactionId);
      await api.post('/transactions/return', { transaction_id: transactionId });
      // Refresh data after successful return
      await fetchStudentData();
    } catch (err) {
      setError('Failed to return resource. Please try again or contact librarian.');
      console.error(err);
    } finally {
      setReturningId(null);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate total fine amount
  const totalFines = fines.reduce((total, fine) => {
    if (fine.status === 'pending') {
      return total + parseFloat(fine.amount);
    }
    return total;
  }, 0).toFixed(2);

  if (loading && !returningId) return <StudentLayout><div>Loading your information...</div></StudentLayout>;
  if (error) return <StudentLayout><div className="error-message">{error}</div></StudentLayout>;

  return (
    <StudentLayout>
      <div className="student-dashboard">
        <h1>Welcome, {currentUser.username}</h1>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Current Checkouts</h3>
            <p className="stat-value">{checkouts.filter(c => !c.return_time).length}</p>
          </div>
          
          <div className="stat-card">
            <h3>Overdue Items</h3>
            <p className="stat-value warning">
              {checkouts.filter(c => 
                !c.return_time && new Date(c.due_time) < new Date()
              ).length}
            </p>
          </div>
          
          <div className="stat-card">
            <h3>Pending Fines</h3>
            <p className="stat-value warning">${totalFines}</p>
          </div>
        </div>
        
        <div className="recent-checkout-section">
          <h2>Your Current Checkouts</h2>
          {checkouts.filter(c => !c.return_time).length === 0 ? (
            <p>You don't have any items checked out.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Checkout Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {checkouts
                  .filter(checkout => !checkout.return_time)
                  .map(checkout => (
                    <tr key={checkout.transaction_id}>
                      <td>{checkout.resource_title}</td>
                      <td>{formatDate(checkout.checkout_time)}</td>
                      <td>{formatDate(checkout.due_time)}</td>
                      <td>
                        {new Date(checkout.due_time) < new Date() ? (
                          <span className="status-badge overdue">Overdue</span>
                        ) : (
                          <span className="status-badge borrowed">Borrowed</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn-return"
                          onClick={() => handleReturn(checkout.transaction_id)}
                          disabled={returningId === checkout.transaction_id}
                        >
                          {returningId === checkout.transaction_id ? 'Returning...' : 'Return'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
