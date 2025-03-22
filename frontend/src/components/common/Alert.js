// frontend/src/components/common/Alert.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Alert component for displaying messages to the user
 * Supports different variants and auto-dismissal
 */
const Alert = ({
  children,
  variant = 'primary',
  dismissible = false,
  icon = null,
  title = null,
  autoDismiss = false,
  autoDismissTimeout = 5000,
  onClose = null,
  className = '',
  show = true,
  ...props
}) => {
  const [visible, setVisible] = useState(show);

  // Handle visibility change when show prop changes
  useEffect(() => {
    setVisible(show);
  }, [show]);

  // Auto-dismiss timer
  useEffect(() => {
    if (autoDismiss && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoDismissTimeout);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, visible, autoDismissTimeout, onClose]);

  // Handle close
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  // Get icon based on variant if not explicitly provided
  const getDefaultIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case 'success':
        return 'check-circle-fill';
      case 'danger':
        return 'exclamation-triangle-fill';
      case 'warning':
        return 'exclamation-circle-fill';
      case 'info':
        return 'info-circle-fill';
      default:
        return null;
    }
  };

  // Don't render if not visible
  if (!visible) return null;

  return (
    <div
      className={`alert alert-${variant} ${dismissible ? 'alert-dismissible fade show' : ''} ${className}`}
      role="alert"
      {...props}
    >
      <div className="d-flex align-items-center">
        {getDefaultIcon() && (
          <i className={`bi bi-${getDefaultIcon()} me-2`}></i>
        )}
        
        <div className="flex-grow-1">
          {title && (
            <h5 className="alert-heading mb-1">{title}</h5>
          )}
          {typeof children === 'string' ? <p className="mb-0">{children}</p> : children}
        </div>
        
        {dismissible && (
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleClose}
          ></button>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  dismissible: PropTypes.bool,
  icon: PropTypes.string,
  title: PropTypes.string,
  autoDismiss: PropTypes.bool,
  autoDismissTimeout: PropTypes.number,
  onClose: PropTypes.func,
  className: PropTypes.string,
  show: PropTypes.bool
};

export default Alert;