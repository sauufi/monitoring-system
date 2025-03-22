// frontend/src/routes/index.js
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Layout Components
import Layout from '../components/layout/Layout';

// Auth Components
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';

// Private Route Component
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// Dashboard Components
import Dashboard from '../pages/Dashboard';

// Monitor Components
import Monitors from '../pages/Monitors';
import MonitorDetail from '../pages/MonitorDetail';
import AddMonitor from '../pages/AddMonitor';
import EditMonitor from '../pages/EditMonitor';

// Notification Components
import Notifications from '../pages/Notifications';
import NotificationChannels from '../pages/NotificationChannels';
import AddChannel from '../pages/AddChannel';

// Status Page Components
import StatusPages from '../pages/StatusPages';
import StatusPageDetail from '../pages/StatusPageDetail';
import AddStatusPage from '../pages/AddStatusPage';
import PublicStatusPage from '../pages/PublicStatusPage';

// Settings Component
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';

// 404 Component
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      
      <Route path="/reset-password" element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      } />
      
      <Route path="/verify-email" element={
        <PublicRoute>
          <VerifyEmail />
        </PublicRoute>
      } />
      
      <Route path="/public/status/:slug" element={<PublicStatusPage />} />

      {/* Private Routes */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/monitors" element={
        <PrivateRoute>
          <Layout>
            <Monitors />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/monitors/add" element={
        <PrivateRoute>
          <Layout>
            <AddMonitor />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/monitors/:id" element={
        <PrivateRoute>
          <Layout>
            <MonitorDetail />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/monitors/:id/edit" element={
        <PrivateRoute>
          <Layout>
            <EditMonitor />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/notifications" element={
        <PrivateRoute>
          <Layout>
            <Notifications />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/notification-channels" element={
        <PrivateRoute>
          <Layout>
            <NotificationChannels />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/notification-channels/add" element={
        <PrivateRoute>
          <Layout>
            <AddChannel />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/status-pages" element={
        <PrivateRoute>
          <Layout>
            <StatusPages />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/status-pages/add" element={
        <PrivateRoute>
          <Layout>
            <AddStatusPage />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/status-pages/:id" element={
        <PrivateRoute>
          <Layout>
            <StatusPageDetail />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/settings" element={
        <PrivateRoute>
          <Layout>
            <Settings />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <Profile />
          </Layout>
        </PrivateRoute>
      } />
      
      {/* 404 Route */}
      <Route path="/404" element={<NotFound />} />
      
      {/* Redirect to 404 for any other routes */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;