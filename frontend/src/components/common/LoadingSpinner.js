// frontend/src/components/common/LoadingSpinner.js
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading Spinner component for indicating loading states
 */
const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  centered = false,
  fullPage = false,
  text = null,
  className = '',
  ...props
}) => {
  // Get spinner size
  const spinnerSize = size === 'sm' ? 'spinner-border-sm' : size === 'lg' ? 'spinner-border-lg' : '';
  
  // Create spinner element
  const spinner = (
    <div className={`spinner-border text-${variant} ${spinnerSize} ${className}`} role="status" {...props}>
      <span className="visually-hidden">Loading...</span>
    </div>
  );
  
  // If full page, show a centered spinner over the entire page
  if (fullPage) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
        <div className="text-center">
          {spinner}
          {text && <p className="mt-3">{text}</p>}
        </div>
      </div>
    );
  }
  
  // If centered, wrap spinner in centering div
  if (centered) {
    return (
      <div className="d-flex justify-content-center align-items-center w-100 h-100">
        <div className="text-center">
          {spinner}
          {text && <p className="mt-2">{text}</p>}
        </div>
      </div>
    );
  }
  
  // Text with spinner, aligned
  if (text) {
    return (
      <div className="d-flex align-items-center">
        {spinner}
        <span className="ms-2">{text}</span>
      </div>
    );
  }
  
  // Just return the spinner
  return spinner;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf([
    'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'
  ]),
  centered: PropTypes.bool,
  fullPage: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string
};

export default LoadingSpinner;