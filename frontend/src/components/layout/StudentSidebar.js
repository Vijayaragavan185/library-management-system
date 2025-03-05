// src/components/layout/StudentSidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const StudentSidebar = () => {
  const location = useLocation();
  const currentUser = AuthService.getCurrentUser();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Student Portal</h3>
        <p className="user-role">{currentUser?.role}</p>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('/student/dashboard')}>
            <Link to="/student/dashboard">Dashboard</Link>
          </li>
          <li className={isActive('/student/browse')}>
            <Link to="/student/browse">Browse Resources</Link>
          </li>
          <li className={isActive('/student/history')}>
            <Link to="/student/history">Checkout History</Link>
          </li>
          <li className={isActive('/student/fines')}>
            <Link to="/student/fines">My Fines</Link>
          </li>
          <li className={isActive('/student/profile')}>
            <Link to="/student/profile">My Profile</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default StudentSidebar;