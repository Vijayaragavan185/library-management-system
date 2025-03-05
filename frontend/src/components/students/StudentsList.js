import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentsList = ({ onRefresh }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewStudentId, setViewStudentId] = useState(null);
  const [editStudentId, setEditStudentId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    email: '',
    status: ''
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/students');
        setStudents(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch students data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [onRefresh]);

  const handleView = async (studentId) => {
    try {
      const response = await api.get(`/students/${studentId}`);
      setSelectedStudent(response.data);
      setViewModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch student details:', err);
    }
  };

  const handleEdit = async (studentId) => {
    try {
      const response = await api.get(`/students/${studentId}`);
      const student = response.data;
      
      setEditForm({
        name: student.name,
        department: student.department,
        email: student.email,
        status: student.status
      });
      
      setEditStudentId(studentId);
      setEditModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch student details for editing:', err);
    }
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedStudent(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditStudentId(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/students/${editStudentId}`, editForm);
      
      // Refresh the student list
      const response = await api.get('/students');
      setStudents(response.data);
      
      // Close the modal
      handleCloseEditModal();
    } catch (err) {
      console.error('Failed to update student:', err);
    }
  };

  if (loading) return <div>Loading students...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="students-list">
      <h2>Students Directory</h2>
      
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
          {students.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-data">No students found</td>
            </tr>
          ) : (
            students.map(student => (
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
                  <button 
                    className="btn-view" 
                    onClick={() => handleView(student.student_id)}
                  >
                    View
                  </button>
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(student.student_id)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* View Student Modal */}
      {viewModalOpen && selectedStudent && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseViewModal}>&times;</span>
            <h2>Student Details</h2>
            <div className="student-details">
              <p><strong>ID:</strong> {selectedStudent.student_id}</p>
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <p><strong>Department:</strong> {selectedStudent.department}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              <p><strong>Status:</strong> {selectedStudent.status}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseEditModal}>&times;</span>
            <h2>Edit Student</h2>
            <div className="edit-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={editForm.department}
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <button 
                className="save-button"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;