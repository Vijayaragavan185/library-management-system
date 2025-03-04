// src/components/layout/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const Header = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          Library Management System
        </div>
        <div className="header-actions">
          <span className="username">{currentUser?.username}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;