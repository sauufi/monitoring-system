// frontend/src/pages/Profile.js
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Alert, LoadingSpinner } from '../components/common';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, loadUser } = useContext(AuthContext);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Alert states
  const [profileAlert, setProfileAlert] = useState({ show: false, type: '', message: '' });
  const [passwordAlert, setPasswordAlert] = useState({ show: false, type: '', message: '' });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });
      setLoading(false);
    }
  }, [user]);

  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // Save profile
  const saveProfile = async (e) => {
    e.preventDefault();
    
    try {
      setSavingProfile(true);
      
      const res = await axios.put('/api/auth/profile', profileForm);
      
      // Reload user data
      loadUser();
      
      setProfileAlert({
        show: true,
        type: 'success',
        message: 'Profile updated successfully!'
      });
    } catch (err) {
      setProfileAlert({
        show: true,
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Change password
  const changePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordAlert({
        show: true,
        type: 'danger',
        message: 'New passwords do not match.'
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordAlert({
        show: true,
        type: 'danger',
        message: 'New password must be at least 8 characters long.'
      });
      return;
    }
    
    try {
      setChangingPassword(true);
      
      const res = await axios.put('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordAlert({
        show: true,
        type: 'success',
        message: 'Password changed successfully!'
      });
    } catch (err) {
      setPasswordAlert({
        show: true,
        type: 'danger',
        message: err.response?.data?.message || 'Failed to change password. Please try again.'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Profile</h1>
      </div>

      <div className="row">
        {/* Profile Information */}
        <div className="col-md-6 mb-4">
          <Card
            title="Profile Information"
            icon="person"
          >
            {profileAlert.show && (
              <Alert
                variant={profileAlert.type}
                dismissible
                onClose={() => setProfileAlert({ show: false })}
                className="mb-4"
              >
                {profileAlert.message}
              </Alert>
            )}

            <form onSubmit={saveProfile}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={savingProfile}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Change Password */}
        <div className="col-md-6 mb-4">
          <Card
            title="Change Password"
            icon="lock"
          >
            {passwordAlert.show && (
              <Alert
                variant={passwordAlert.type}
                dismissible
                onClose={() => setPasswordAlert({ show: false })}
                className="mb-4"
              >
                {passwordAlert.message}
              </Alert>
            )}

            <form onSubmit={changePassword}>
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="8"
                />
                <div className="form-text">Password must be at least 8 characters long.</div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={changingPassword}
                >
                  Change Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Account Information */}
      <Card
        title="Account Information"
        icon="info-circle"
        className="mb-4"
      >
        <div className="mb-3">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <div className="text-muted small mb-1">Account Type:</div>
                <div>{user.role === 'admin' ? 'Administrator' : 'Regular User'}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <div className="text-muted small mb-1">Account Created:</div>
                <div>{new Date(user.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;