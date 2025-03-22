// frontend/src/components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-auto py-3 bg-light border-top">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-0 text-muted">
              © {currentYear} Monitoring System. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link to="/privacy-policy" className="text-decoration-none text-muted small">
                  Privacy Policy
                </Link>
              </li>
              <li className="list-inline-item">
                <span className="text-muted">•</span>
              </li>
              <li className="list-inline-item">
                <Link to="/terms-of-service" className="text-decoration-none text-muted small">
                  Terms of Service
                </Link>
              </li>
              <li className="list-inline-item">
                <span className="text-muted">•</span>
              </li>
              <li className="list-inline-item">
                <a 
                  href="https://github.com/yourusername/monitoring-system" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-decoration-none text-muted small"
                >
                  <i className="bi bi-github me-1"></i>
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;