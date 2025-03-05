// src/components/layout/StudentLayout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import StudentSidebar from './StudentSidebar';

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            Library Management System - Student Portal
          </div>
          <div className="header-actions">
            <span className="username">{currentUser?.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="content-container">
        <StudentSidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;