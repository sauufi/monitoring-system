// frontend/src/components/layout/Sidebar.js
import React, { useContext } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ collapsed, toggleSidebar, isMobile }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  // Check if path is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Define sidebar menu items
  const menuItems = [
    {
      path: '/',
      exact: true,
      icon: 'bi-speedometer2',
      text: 'Dashboard'
    },
    {
      path: '/monitors',
      icon: 'bi-display',
      text: 'Monitors'
    },
    {
      path: '/status-pages',
      icon: 'bi-layout-text-window',
      text: 'Status Pages'
    },
    {
      path: '/notifications',
      icon: 'bi-bell',
      text: 'Notifications'
    },
    {
      path: '/notification-channels',
      icon: 'bi-megaphone',
      text: 'Channels'
    },
    {
      path: '/settings',
      icon: 'bi-gear',
      text: 'Settings'
    }
  ];
  
  // Admin only menu items
  const adminMenuItems = [
    {
      path: '/admin/users',
      icon: 'bi-people',
      text: 'Users'
    },
    {
      path: '/admin/system',
      icon: 'bi-hdd-stack',
      text: 'System'
    }
  ];
  
  // Render menu items
  const renderMenuItems = (items) => {
    return items.map((item, index) => (
      <li className="nav-item" key={index}>
        <NavLink
          to={item.path}
          end={item.exact}
          className={({ isActive }) => 
            `nav-link d-flex align-items-center py-3 px-3 ${isActive ? 'active' : ''}`
          }
          onClick={() => isMobile && toggleSidebar()}
        >
          <i className={`bi ${item.icon} me-2`}></i>
          <span className={collapsed ? 'd-none' : ''}>
            {item.text}
          </span>
        </NavLink>
      </li>
    ));
  };
  
  return (
    <div 
      className={`sidebar d-flex flex-column flex-shrink-0 bg-light border-end ${
        collapsed ? 'sidebar-collapsed' : ''
      }`}
      style={{ 
        width: collapsed ? '60px' : '280px', 
        position: isMobile ? 'fixed' : 'sticky',
        height: '100vh',
        top: 0,
        zIndex: 1000,
        left: isMobile && collapsed ? '-60px' : 0,
        transition: 'width 0.3s ease, left 0.3s ease'
      }}
    >
      {isMobile && !collapsed && (
        <div className="overlay" onClick={toggleSidebar} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: -1
        }}></div>
      )}
      
      {/* Sidebar header */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
        {!collapsed && (
          <Link className="sidebar-brand d-flex align-items-center" to="/">
            <i className="bi bi-graph-up me-2 text-primary"></i>
            <span className="fs-5 fw-semibold">Monitoring</span>
          </Link>
        )}
        
        <button 
          className="btn btn-sm btn-link text-muted p-1"
          onClick={toggleSidebar}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`bi fs-5 ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
        </button>
      </div>
      
      {/* User info - only shown when not collapsed */}
      {!collapsed && (
        <div className="p-3 border-bottom d-flex align-items-center">
          <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
            <span className="fw-bold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <div className="d-flex flex-column">
            <span className="fw-semibold">{user?.name || 'User'}</span>
            <small className="text-muted">{user?.email || 'user@example.com'}</small>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <ul className="nav nav-pills flex-column mt-2 flex-grow-1">
        {renderMenuItems(menuItems)}
        
        {/* Divider */}
        {user?.role === 'admin' && (
          <>
            <li className="nav-item py-2">
              <div className="d-flex align-items-center px-3">
                <div className="border-bottom flex-grow-1"></div>
                {!collapsed && (
                  <span className="text-muted small mx-2">ADMIN</span>
                )}
                <div className="border-bottom flex-grow-1"></div>
              </div>
            </li>
            {renderMenuItems(adminMenuItems)}
          </>
        )}
      </ul>
      
      {/* Sidebar footer */}
      <div className="p-3 border-top mt-auto">
        {!collapsed ? (
          <div className="d-flex flex-column">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">Version</span>
              <span className="small">1.0.0</span>
            </div>
            <a 
              href="https://github.com/yourusername/monitoring-system" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
            >
              <i className="bi bi-github me-2"></i>
              <span>GitHub</span>
            </a>
          </div>
        ) : (
          <div className="d-flex justify-content-center">
            <a 
              href="https://github.com/yourusername/monitoring-system" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-secondary p-1"
              title="GitHub Repository"
            >
              <i className="bi bi-github"></i>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;