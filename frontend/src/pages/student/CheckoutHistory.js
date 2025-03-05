// src/pages/student/CheckoutHistory.js
import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import api from '../../services/api';
import AuthService from '../../services/auth.service';

const CheckoutHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/transactions/student/${currentUser.student_id}`);
        setTransactions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch your checkout history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser.student_id]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Function to check if a transaction is overdue
  const isOverdue = (dueDate, returnDate) => {
    if (returnDate) return false; // Already returned
    const now = new Date();
    const due = new Date(dueDate);
    return now > due;
  };

  if (loading) return <StudentLayout><div>Loading your checkout history...</div></StudentLayout>;
  if (error) return <StudentLayout><div className="error-message">{error}</div></StudentLayout>;

  return (
    <StudentLayout>
      <div className="checkout-history">
        <h1>Your Checkout History</h1>
        
        {transactions.length === 0 ? (
          <p>You don't have any checkout history yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Checkout Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.transaction_id}>
                  <td>{transaction.resource_title}</td>
                  <td>{formatDate(transaction.checkout_time)}</td>
                  <td>{formatDate(transaction.due_time)}</td>
                  <td>{formatDate(transaction.return_time)}</td>
                  <td>
                    {transaction.return_time ? (
                      <span className="status-badge returned">Returned</span>
                    ) : isOverdue(transaction.due_time, transaction.return_time) ? (
                      <span className="status-badge overdue">Overdue</span>
                    ) : (
                      <span className="status-badge borrowed">Borrowed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </StudentLayout>
  );
};

export default CheckoutHistory;