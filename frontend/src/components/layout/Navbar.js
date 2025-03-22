// frontend/src/components/layout/Navbar.js
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Toggle user dropdown menu
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };
  
  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container-fluid">
        {/* Brand and sidebar toggle */}
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-link text-light d-lg-none me-2"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi bi-graph-up me-2"></i>
            <span>Monitoring System</span>
          </Link>
        </div>
        
        {/* Right menu items */}
        <div className="d-flex align-items-center">
          {/* Notifications dropdown */}
          <div className="nav-item dropdown me-3 position-relative">
            <button 
              className="btn btn-link text-light position-relative p-1"
              onClick={toggleNotifications}
            >
              <i className="bi bi-bell fs-5"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
                <span className="visually-hidden">unread notifications</span>
              </span>
            </button>
            
            {showNotifications && (
              <div className="dropdown-menu dropdown-menu-end show p-0 overflow-hidden shadow" style={{ width: '320px' }}>
                <div className="p-2 bg-light border-bottom d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Notifications</h6>
                  <Link to="/notifications" className="text-decoration-none small">
                    View all
                  </Link>
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <div className="list-group list-group-flush">
                    <Link to="#" className="list-group-item list-group-item-action p-3">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">Website Monitor Down</h6>
                        <small className="text-muted">3 mins ago</small>
                      </div>
                      <p className="mb-1 text-danger">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        example.com is down
                      </p>
                    </Link>
                    
                    <Link to="#" className="list-group-item list-group-item-action p-3">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">New Incident Created</h6>
                        <small className="text-muted">1 hour ago</small>
                      </div>
                      <p className="mb-1">
                        <i className="bi bi-info-circle me-1"></i>
                        API Service Degraded Performance
                      </p>
                    </Link>
                    
                    <Link to="#" className="list-group-item list-group-item-action p-3">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">Monitor Recovered</h6>
                        <small className="text-muted">2 hours ago</small>
                      </div>
                      <p className="mb-1 text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        api.example.com is back up
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* User dropdown */}
          <div className="nav-item dropdown">
            <button 
              className="btn btn-link text-light text-decoration-none dropdown-toggle d-flex align-items-center"
              onClick={toggleUserMenu}
            >
              <div className="avatar rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                <span className="fw-bold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <span className="d-none d-md-inline">{user?.name || 'User'}</span>
            </button>
            
            {showUserMenu && (
              <div className="dropdown-menu dropdown-menu-end show shadow">
                <div className="px-4 py-3">
                  <span className="dropdown-item-text">Signed in as</span>
                  <h6 className="dropdown-item-text">{user?.email || 'user@example.com'}</h6>
                </div>
                <div className="dropdown-divider"></div>
                <Link className="dropdown-item" to="/profile">
                  <i className="bi bi-person me-2"></i>
                  Profile
                </Link>
                <Link className="dropdown-item" to="/settings">
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;