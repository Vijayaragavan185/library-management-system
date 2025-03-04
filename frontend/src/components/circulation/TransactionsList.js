// src/components/circulation/TransactionsList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const TransactionsList = ({ refreshTrigger }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/transactions');
        setTransactions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch transactions data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [refreshTrigger]);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div className="error-message">{error}</div>;

  // Function to format date
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

  return (
    <div className="transactions-list">
      <h2>Recent Transactions</h2>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Resource</th>
            <th>Checkout Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="7" className="no-data">No transactions found</td>
            </tr>
          ) : (
            transactions.map(transaction => (
              <tr key={transaction.transaction_id}>
                <td>{transaction.transaction_id}</td>
                <td>{transaction.student_name}</td>
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsList;