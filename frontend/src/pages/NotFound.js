// frontend/src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center py-5">
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-5">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
          
          <div className="d-flex justify-content-center gap-3">
            <Link to="/" className="btn btn-primary">
              <i className="bi bi-house me-2"></i>
              Go to Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-outline-secondary"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Go Back
            </button>
          </div>
          
          <div className="mt-5">
            <div className="text-muted">
              <i className="bi bi-exclamation-circle me-2"></i>
              If you believe this is an error, please contact support.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;