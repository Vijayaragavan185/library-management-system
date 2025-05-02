// src/components/fines/FinesList.js - Enhanced version
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FinesList = ({ refreshTrigger }) => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState(null);

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
      setActionLoading(true);
      setSuccess(null);
      
      await api.patch(`/fines/${fineId}/pay`);
      setSuccess(`Fine #${fineId} marked as paid successfully.`);
      
      // Refresh fines list
      const response = await api.get('/fines');
      setFines(response.data);
    } catch (err) {
      setError('Failed to update fine status');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWaiveFine = async (fineId) => {
    try {
      setActionLoading(true);
      setSuccess(null);
      
      await api.patch(`/fines/${fineId}/waive`);
      setSuccess(`Fine #${fineId} waived successfully.`);
      
      // Refresh fines list
      const response = await api.get('/fines');
      setFines(response.data);
    } catch (err) {
      setError('Failed to waive fine');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter fines by status and search term
  const filteredFines = fines.filter(fine => {
    const matchesStatus = filterStatus === 'all' || fine.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
                          fine.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fine.resource_title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate totals
  const totalAmount = filteredFines.reduce((total, fine) => total + parseFloat(fine.amount), 0).toFixed(2);
  const paidAmount = filteredFines
    .filter(fine => fine.status === 'paid')
    .reduce((total, fine) => total + parseFloat(fine.amount), 0)
    .toFixed(2);
  const pendingAmount = filteredFines
    .filter(fine => fine.status === 'pending')
    .reduce((total, fine) => total + parseFloat(fine.amount), 0)
    .toFixed(2);

  if (loading) return <div>Loading fines...</div>;
  if (error) return <div className="error-message">{error}</div>;

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="fines-management">
      <h2>Fines Management</h2>
      
      {success && <div className="success-message">{success}</div>}
      
      <div className="fines-summary">
        <div className="summary-card">
          <h3>Total Fines</h3>
          <p className="amount">${totalAmount}</p>
        </div>
        <div className="summary-card">
          <h3>Paid Fines</h3>
          <p className="amount">${paidAmount}</p>
        </div>
        <div className="summary-card">
          <h3>Pending Fines</h3>
          <p className="amount">${pendingAmount}</p>
        </div>
      </div>
      
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by student or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="status-filter">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="waived">Waived</option>
          </select>
        </div>
      </div>
      
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
          {filteredFines.length === 0 ? (
            <tr>
              <td colSpan="8" className="no-data">No fines found matching your filters</td>
            </tr>
          ) : (
            filteredFines.map(fine => (
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
                        disabled={actionLoading}
                      >
                        Mark Paid
                      </button>
                      <button 
                        className="btn-warning"
                        onClick={() => handleWaiveFine(fine.fine_id)}
                        disabled={actionLoading}
                      >
                        Waive
                      </button>
                    </>
                  )}
                  {fine.status !== 'pending' && (
                    <span>No actions available</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <div className="fines-report">
        <h3>Fine Reports</h3>
        <div className="report-buttons">
          <button className="btn-report">Generate Monthly Report</button>
          <button className="btn-report">Export to CSV</button>
        </div>
      </div>
    </div>
  );
};

export default FinesList;
