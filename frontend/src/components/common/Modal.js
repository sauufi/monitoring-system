// frontend/src/components/common/Modal.js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

/**
 * Modal component for displaying dialogs and popups
 */
const Modal = ({
  show = false,
  title = null,
  children,
  footer = null,
  size = 'md',
  centered = false,
  scrollable = false,
  closeButton = true,
  backdrop = true,
  onClose,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  ...props
}) => {
  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };

    if (show) {
      // Add escape key handler
      document.addEventListener('keydown', handleEscape);
      // Add body class to prevent scrolling
      document.body.classList.add('modal-open');
    }

    return () => {
      // Remove escape key handler
      document.removeEventListener('keydown', handleEscape);
      // Remove body class
      document.body.classList.remove('modal-open');
    };
  }, [show, onClose]);

  // Close when clicking backdrop if backdrop is not 'static'
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && backdrop !== 'static') {
      onClose();
    }
  };

  // Don't render if not showing
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`modal fade ${show ? 'show' : ''}`} 
        style={{ display: show ? 'block' : 'none' }}
        tabIndex="-1" 
        role="dialog"
        onClick={handleBackdropClick}
        {...props}
      >
        <div 
          className={`modal-dialog ${size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : ''} ${centered ? 'modal-dialog-centered' : ''} ${scrollable ? 'modal-dialog-scrollable' : ''} ${className}`}
          role="document"
        >
          <div className="modal-content">
            {/* Header */}
            {(title || closeButton) && (
              <div className={`modal-header ${headerClassName}`}>
                {title && (
                  typeof title === 'string' ? (
                    <h5 className="modal-title">{title}</h5>
                  ) : title
                )}
                {closeButton && (
                  <button 
                    type="button" 
                    className="btn-close" 
                    aria-label="Close"
                    onClick={onClose}
                  ></button>
                )}
              </div>
            )}
            
            {/* Body */}
            <div className={`modal-body ${bodyClassName}`}>
              {children}
            </div>
            
            {/* Footer */}
            {footer && (
              <div className={`modal-footer ${footerClassName}`}>
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Backdrop overlay */}
      <div 
        className={`modal-backdrop fade ${show ? 'show' : ''}`} 
        style={{ display: show ? 'block' : 'none' }}
      ></div>
    </>
  );
};

// Predefined confirmation modal
Modal.Confirm = ({
  show = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  size = 'md',
  icon = null,
  isLoading = false,
  onConfirm,
  onCancel,
  ...props
}) => (
  <Modal
    show={show}
    title={title}
    size={size}
    onClose={onCancel}
    footer={
      <>
        <Button 
          variant="outline-secondary" 
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button 
          variant={confirmVariant} 
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </>
    }
    {...props}
  >
    <div className="d-flex">
      {icon && (
        <div className="me-3">
          <i className={`bi bi-${icon} fs-1 text-${confirmVariant}`}></i>
        </div>
      )}
      <div>
        {typeof message === 'string' ? (
          <p className="mb-0">{message}</p>
        ) : message}
      </div>
    </div>
  </Modal>
);

// Delete confirmation modal variant
Modal.Delete = (props) => (
  <Modal.Confirm
    title="Confirm Deletion"
    message="Are you sure you want to delete this item? This action cannot be undone."
    confirmLabel="Delete"
    confirmVariant="danger"
    icon="trash"
    {...props}
  />
);

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  centered: PropTypes.bool,
  scrollable: PropTypes.bool,
  closeButton: PropTypes.bool,
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['static'])]),
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string
};

Modal.Confirm.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  confirmVariant: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  icon: PropTypes.string,
  isLoading: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default Modal;