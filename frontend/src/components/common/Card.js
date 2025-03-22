// frontend/src/components/common/Card.js
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card component for displaying content in a box with optional header and footer
 */
const Card = ({
  children,
  title = null,
  subtitle = null,
  icon = null,
  headerAction = null,
  footer = null,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  onClick = null,
  ...props
}) => {
  return (
    <div 
      className={`card shadow-sm ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      {...props}
    >
      {/* Render header if title, subtitle, icon, or headerAction is provided */}
      {(title || subtitle || icon || headerAction) && (
        <div className={`card-header ${headerClassName}`}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {icon && (
                <i className={`bi bi-${icon} me-2 ${subtitle ? 'fs-4' : 'fs-5'}`}></i>
              )}
              <div>
                {title && (
                  typeof title === 'string' ? (
                    <h5 className="card-title mb-0">{title}</h5>
                  ) : title
                )}
                {subtitle && (
                  typeof subtitle === 'string' ? (
                    <div className="card-subtitle text-muted small">{subtitle}</div>
                  ) : subtitle
                )}
              </div>
            </div>
            {headerAction && (
              <div>
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Card body */}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
      
      {/* Optional footer */}
      {footer && (
        <div className={`card-footer ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  icon: PropTypes.string,
  headerAction: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  onClick: PropTypes.func
};

export default Card;