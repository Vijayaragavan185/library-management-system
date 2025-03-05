// src/components/students/PendingApprovals.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PendingApprovals = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchPendingStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/students/pending');
        setPendingStudents(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch pending approvals');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingStudents();
  }, [refreshTrigger]);

  const handleApprove = async (studentId) => {
    try {
      await api.patch(`/students/${studentId}/approve`);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to approve student:', err);
    }
  };

  const handleReject = async (studentId) => {
    try {
      await api.patch(`/students/${studentId}/reject`);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to reject student:', err);
    }
  };

  if (loading) return <div>Loading pending approvals...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="pending-approvals">
      <h2>Student Approvals</h2>
      
      {pendingStudents.length === 0 ? (
        <p>No pending approvals at this time.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingStudents.map(student => (
              <tr key={student.student_id}>
                <td>{student.student_id}</td>
                <td>{student.name}</td>
                <td>{student.department}</td>
                <td>{student.email}</td>
                <td>
                  <span className={`status-badge ${student.status}`}>
                    {student.status}
                  </span>
                </td>
                <td className="actions">
                  {student.status !== 'active' && (
                    <button 
                      className="btn-approve"
                      onClick={() => handleApprove(student.student_id)}
                    >
                      Approve
                    </button>
                  )}
                  {student.status !== 'suspended' && (
                    <button 
                      className="btn-reject"
                      onClick={() => handleReject(student.student_id)}
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingApprovals;