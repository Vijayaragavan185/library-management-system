// src/components/layout/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const Sidebar = () => {
  const location = useLocation();
  const currentUser = AuthService.getCurrentUser();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Library System</h3>
        <p className="user-role">{currentUser?.role}</p>
      </div>
      
        <nav className="sidebar-nav">
        <ul>

            <li className={isActive('/dashboard')}>
            <Link to="/dashboard">Dashboard</Link>
            </li>
            <li className={isActive('/students')}>
            <Link to="/students">Students</Link>
            </li>
            <li className={isActive('/resources')}>
            <Link to="/resources">Resources</Link>
            </li>
            <li className={isActive('/circulation')}>
            <Link to="/circulation">Circulation</Link>
            </li>
            <li className={isActive('/categories')}>
            <Link to="/categories">Categories</Link>
            </li>
            <li className={isActive('/fines')}>
            <Link to="/fines">Fines</Link>
            </li>            
        </ul>
        </nav>
    </div>
  );
};

export default Sidebar;