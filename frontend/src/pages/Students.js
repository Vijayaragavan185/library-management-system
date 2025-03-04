// src/pages/Students.js
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import StudentsList from '../components/students/StudentsList';
import AddStudent from '../components/students/AddStudent';

const Students = () => {
  const [refreshList, setRefreshList] = useState(false);
  
  const handleStudentAdded = () => {
    setRefreshList(prev => !prev);
  };
  
  return (
    <Layout>
      <div className="students-page">
        <h1>Students Management</h1>
        
        <div className="content-grid">
          <div className="main-content">
            <StudentsList key={refreshList ? 'refresh' : 'initial'} />
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