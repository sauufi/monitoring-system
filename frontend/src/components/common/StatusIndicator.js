// frontend/src/components/common/StatusIndicator.js
import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatusIndicator component - visually shows operational status
 */
const StatusIndicator = ({
  status,
  size = 'md',
  pulse = false,
  showLabel = false,
  labelPosition = 'right',
  className = '',
  ...props
}) => {
  // Normalize status
  let normalizedStatus = status.toLowerCase();
  
  // Map status to color and label
  let color, label;
  
  switch (normalizedStatus) {
    case 'up':
    case 'operational':
    case 'success':
    case 'good':
      color = 'var(--bs-success, #198754)';
      label = showLabel ? (status === 'operational' ? 'Operational' : 'Up') : '';
      break;
      
    case 'down':
    case 'outage':
    case 'error':
    case 'critical':
      color = 'var(--bs-danger, #dc3545)';
      label = showLabel ? (status === 'outage' ? 'Outage' : 'Down') : '';
      pulse = pulse !== false; // Default to pulse for down status
      break;
      
    case 'degraded':
    case 'warning':
    case 'partial':
    case 'slow':
      color = 'var(--bs-warning, #ffc107)';
      label = showLabel ? 'Degraded' : '';
      break;
      
    case 'pending':
    case 'maintenance':
    case 'inactive':
      color = 'var(--bs-secondary, #6c757d)';
      label = showLabel ? (status === 'maintenance' ? 'Maintenance' : 'Pending') : '';
      break;
      
    default:
      color = 'var(--bs-info, #0dcaf0)';
      label = showLabel ? (status || 'Unknown') : '';
  }
  
  // Get dot size based on size prop
  const getDotSize = () => {
    switch (size) {
      case 'xs': return '6px';
      case 'sm': return '8px';
      case 'lg': return '14px';
      case 'xl': return '18px';
      default: return '10px'; // Medium size
    }
  };
  
  // Get label size based on size prop
  const getLabelSize = () => {
    switch (size) {
      case 'xs': return '12px';
      case 'sm': return '14px';
      case 'lg': return '18px';
      case 'xl': return '20px';
      default: return '16px'; // Medium size
    }
  };
  
  const dotSize = getDotSize();
  const fontSize = getLabelSize();
  
  // Render the indicator and optional label
  return (
    <div 
      className={`d-inline-flex align-items-center ${className}`}
      {...props}
    >
      {labelPosition === 'left' && label && (
        <span className="me-2" style={{ fontSize }}>
          {label}
        </span>
      )}
      
      <div
        className={`rounded-circle ${pulse ? 'position-relative' : ''}`}
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
          display: 'inline-block'
        }}
      >
        {pulse && (
          <div
            className="position-absolute rounded-circle"
            style={{
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: color,
              opacity: 0.3,
              animation: 'pulse 2s infinite',
              transform: 'scale(1)',
              transformOrigin: 'center'
            }}
          />
        )}
      </div>
      
      {labelPosition === 'right' && label && (
        <span className="ms-2" style={{ fontSize }}>
          {label}
        </span>
      )}
      
      {/* Pulse animation keyframes */}
      {pulse && (
        <style>
          {`
            @keyframes pulse {
              0% {
                transform: scale(1);
                opacity: 0.5;
              }
              70% {
                transform: scale(2);
                opacity: 0;
              }
              100% {
                transform: scale(2.5);
                opacity: 0;
              }
            }
          `}
        </style>
      )}
    </div>
  );
};

StatusIndicator.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  pulse: PropTypes.bool,
  showLabel: PropTypes.bool,
  labelPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string
};

export default StatusIndicator;