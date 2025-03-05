// src/pages/student/StudentProfile.js
import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import api from '../../services/api';
import AuthService from '../../services/auth.service';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/students/${currentUser.student_id}`);
        setProfile(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch your profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser.student_id]);

  if (loading) return <StudentLayout><div>Loading your profile...</div></StudentLayout>;
  if (error) return <StudentLayout><div className="error-message">{error}</div></StudentLayout>;
  if (!profile) return <StudentLayout><div>No profile information found.</div></StudentLayout>;

  return (
    <StudentLayout>
      <div className="student-profile">
        <h1>Your Profile</h1>
        
        <div className="profile-card">
          <div className="profile-header">
            <h2>{profile.name}</h2>
            <span className={`status-badge ${profile.status}`}>{profile.status}</span>
          </div>
          
          <div className="profile-details">
            <div className="detail-group">
              <label>Student ID</label>
              <p>{profile.student_id}</p>
            </div>
            
            <div className="detail-group">
              <label>Email</label>
              <p>{profile.email}</p>
            </div>
            
            <div className="detail-group">
              <label>Department</label>
              <p>{profile.department}</p>
            </div>
            
            <div className="detail-group">
              <label>Username</label>
              <p>{currentUser.username}</p>
            </div>
            
            <div className="detail-group">
              <label>Account Status</label>
              <p className="capitalize">{profile.status}</p>
            </div>
          </div>
          
          <div className="profile-help">
            <h3>Need to update your information?</h3>
            <p>Please contact the library administration office to update your personal information.</p>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;