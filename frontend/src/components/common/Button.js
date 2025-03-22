// frontend/src/components/common/Button.js
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Button component that can be rendered as a button or Link
 * Supports loading state, icons, and various styles
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  to = null,
  href = null,
  onClick = null,
  ...props
}) => {
  // Base classes
  const baseClasses = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''} ${className}`;
  
  // Content with optional icon
  const content = (
    <>
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <i className={`bi bi-${icon} ${children ? 'me-2' : ''}`}></i>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <i className={`bi bi-${icon} ${children ? 'ms-2' : ''}`}></i>
          )}
        </>
      )}
    </>
  );
  
  // Render as Link if 'to' prop is provided
  if (to) {
    return (
      <Link
        to={to}
        className={baseClasses}
        {...props}
      >
        {content}
      </Link>
    );
  }
  
  // Render as anchor if 'href' prop is provided
  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        {...props}
      >
        {content}
      </a>
    );
  }
  
  // Render as button by default
  return (
    <button
      type={type}
      className={baseClasses}
      disabled={isLoading || disabled}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link',
    'outline-primary', 'outline-secondary', 'outline-success', 'outline-danger', 
    'outline-warning', 'outline-info', 'outline-light', 'outline-dark'
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  to: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func
};

export default Button;