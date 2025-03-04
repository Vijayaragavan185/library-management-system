// src/routes/index.js - Make sure it has a proper default export
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

// Components
import Login from '../components/auth/Login';
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import Resources from '../pages/Resources';
import Circulation from '../pages/Circulation';
import Categories from '../pages/Categories';
import Fines from '../pages/Fines';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/students" element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        } />
        
        <Route path="/resources" element={
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        } />
        
        <Route path="/circulation" element={
          <ProtectedRoute>
            <Circulation />
          </ProtectedRoute>
        } />

        <Route path="/categories" element={
        <ProtectedRoute>
            <Categories />
        </ProtectedRoute>
        } />

        <Route path="/fines" element={
        <ProtectedRoute>
            <Fines />
        </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes; // Make sure you have this default export