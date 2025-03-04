// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalResources: 0,
    resourcesCheckedOut: 0,
    overdueResources: 0
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // This would be replaced with actual endpoints when implemented
        const studentsRes = await api.get('/students');
        const resourcesRes = await api.get('/resources');
        const transactionsRes = await api.get('/transactions');
        
        // Count resources that are checked out
        const checkedOut = resourcesRes.data.filter(r => r.status === 'borrowed').length;
        
        // For demonstration - in reality you'd have an endpoint for this
        const overdue = transactionsRes.data.filter(t => 
          t.return_time === null && new Date(t.due_time) < new Date()
        ).length;
        
        setStats({
          totalStudents: studentsRes.data.length,
          totalResources: resourcesRes.data.length,
          resourcesCheckedOut: checkedOut,
          overdueResources: overdue
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Layout>
        <div>Loading dashboard...</div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="dashboard">
        <h1>Dashboard</h1>
        
        <div className="stat-cards">
          <div className="stat-card">
            <h3>Total Students</h3>
            <p className="stat-value">{stats.totalStudents}</p>
          </div>
          
          <div className="stat-card">
            <h3>Total Resources</h3>
            <p className="stat-value">{stats.totalResources}</p>
          </div>
          
          <div className="stat-card">
            <h3>Checked Out</h3>
            <p className="stat-value">{stats.resourcesCheckedOut}</p>
          </div>
          
          <div className="stat-card warning">
            <h3>Overdue</h3>
            <p className="stat-value">{stats.overdueResources}</p>
          </div>
        </div>
        
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          {/* Add recent transactions or activity here */}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;