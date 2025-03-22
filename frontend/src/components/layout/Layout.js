// frontend/src/components/layout/Layout.js
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Main layout component that wraps the application content
 * Includes the navigation bar, sidebar, and footer
 */
const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Toggle sidebar on mobile devices
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth < 992) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Initial check
    checkScreenSize();

    // Listen for window resize events
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="container-fluid flex-grow-1">
        <div className="row">
          <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} isMobile={isMobile} />
          
          <main className={`${sidebarCollapsed ? 'col-md-12' : 'col-md-9 col-lg-10'} ms-sm-auto px-md-4 py-4`}>
            {children}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;