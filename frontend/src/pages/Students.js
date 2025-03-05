// src/pages/Students.js - Update to include pending approvals
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import StudentsList from '../components/students/StudentsList';
import AddStudent from '../components/students/AddStudent';
import PendingApprovals from '../components/students/PendingApprovals';

const Students = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  
  const handleStudentAdded = () => {
    setRefreshTrigger(prev => !prev);
  };
  
  return (
    <Layout>
      <div className="students-page">
        <h1>Students Management</h1>
        
        <div className="approvals-section">
          <PendingApprovals />
        </div>
        
        <div className="content-grid">
          <div className="main-content">
            <StudentsList onRefresh={refreshTrigger} />
          </div>
          
          <div className="side-content">
            <AddStudent onStudentAdded={handleStudentAdded} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Students;