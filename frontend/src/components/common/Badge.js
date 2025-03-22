// frontend/src/components/common/Badge.js
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge component for displaying status indicators or counts
 */
const Badge = ({
  children,
  variant = 'primary',
  pill = false,
  dot = false,
  size = 'md',
  icon = null,
  className = '',
  ...props
}) => {
  // Get size class
  const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : '';
  
  // If dot is true, show only a dot without text
  if (dot) {
    return (
      <span 
        className={`badge rounded-circle p-1 bg-${variant} ${className}`}
        style={{ width: '8px', height: '8px', display: 'inline-block' }}
        {...props}
      />
    );
  }

  return (
    <span 
      className={`badge ${pill ? 'rounded-pill' : ''} bg-${variant} ${sizeClass} ${className}`}
      {...props}
    >
      {icon && <i className={`bi bi-${icon} ${children ? 'me-1' : ''}`}></i>}
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'
  ]),
  pill: PropTypes.bool,
  dot: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.string,
  className: PropTypes.string
};

export default Badge;