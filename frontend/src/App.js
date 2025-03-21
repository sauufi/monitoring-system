// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';

// Monitor Components
import Monitors from './components/monitors/Monitors';
import MonitorDetail from './components/monitors/MonitorDetail';
import AddMonitor from './components/monitors/AddMonitor';
import EditMonitor from './components/monitors/EditMonitor';

// Notification Components
import Notifications from './components/notifications/Notifications';
import NotificationChannels from './components/notifications/NotificationChannels';
import AddChannel from './components/notifications/AddChannel';

// Status Page Components
import StatusPages from './components/status-page/StatusPages';
import StatusPageDetail from './components/status-page/StatusPageDetail';
import AddStatusPage from './components/status-page/AddStatusPage';
import PublicStatusPage from './components/status-page/PublicStatusPage';

// Settings Component
import Settings from './components/settings/Settings';

// Auth Context
import { AuthProvider } from './context/AuthContext';

// Utils
import PrivateRoute from './utils/PrivateRoute';
import { setAuthToken } from './utils/setAuthToken';

// Styles
import './App.css';

// Check for token
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/public/status/:slug" element={<PublicStatusPage />} />

            {/* Private Routes */}
            <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            
            <Route path="/monitors" element={<PrivateRoute><Layout><Monitors /></Layout></PrivateRoute>} />
            <Route path="/monitors/add" element={<PrivateRoute><Layout><AddMonitor /></Layout></PrivateRoute>} />
            <Route path="/monitors/:id" element={<PrivateRoute><Layout><MonitorDetail /></Layout></PrivateRoute>} />
            <Route path="/monitors/:id/edit" element={<PrivateRoute><Layout><EditMonitor /></Layout></PrivateRoute>} />
            
            <Route path="/notifications" element={<PrivateRoute><Layout><Notifications /></Layout></PrivateRoute>} />
            <Route path="/notification-channels" element={<PrivateRoute><Layout><NotificationChannels /></Layout></PrivateRoute>} />
            <Route path="/notification-channels/add" element={<PrivateRoute><Layout><AddChannel /></Layout></PrivateRoute>} />
            
            <Route path="/status-pages" element={<PrivateRoute><Layout><StatusPages /></Layout></PrivateRoute>} />
            <Route path="/status-pages/add" element={<PrivateRoute><Layout><AddStatusPage /></Layout></PrivateRoute>} />
            <Route path="/status-pages/:id" element={<PrivateRoute><Layout><StatusPageDetail /></Layout></PrivateRoute>} />
            
            <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
            
            {/* Redirect to dashboard if logged in and trying to access login/register */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <Sidebar />
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default App;