// frontend/src/components/common/StatusBadge.js
import React from 'react';
import PropTypes from 'prop-types';
import Badge from './Badge';
import { formatMonitorStatus, formatIncidentStatus } from '../../utils/formatters';

/**
 * StatusBadge component for displaying monitor or incident status
 */
const StatusBadge = ({
  status,
  type = 'monitor',
  size = 'md',
  pill = true,
  withDot = false,
  withIcon = true,
  className = '',
  ...props
}) => {
  let statusInfo;
  
  if (type === 'monitor') {
    statusInfo = formatMonitorStatus(status);
    
    // Get icon based on status for monitors
    let icon = null;
    if (withIcon) {
      switch (status) {
        case 'up':
          icon = 'check-circle';
          break;
        case 'down':
          icon = 'x-circle';
          break;
        case 'pending':
          icon = 'hourglass-split';
          break;
        case 'paused':
          icon = 'pause-circle';
          break;
        default:
          icon = 'question-circle';
      }
    }
    
    return (
      <Badge
        variant={statusInfo.class}
        pill={pill}
        size={size}
        icon={withIcon ? icon : null}
        className={className}
        {...props}
      >
        {withDot && (
          <span className={`d-inline-block rounded-circle bg-${withDot === true ? 'light' : withDot} me-1`} style={{ width: '6px', height: '6px' }}></span>
        )}
        {statusInfo.label}
      </Badge>
    );
  } else if (type === 'incident') {
    statusInfo = formatIncidentStatus(status);
    
    // Get icon based on status for incidents
    let icon = null;
    if (withIcon) {
      switch (status) {
        case 'investigating':
          icon = 'search';
          break;
        case 'identified':
          icon = 'info-circle';
          break;
        case 'monitoring':
          icon = 'eye';
          break;
        case 'resolved':
          icon = 'check-circle';
          break;
        default:
          icon = 'question-circle';
      }
    }
    
    return (
      <Badge
        variant={statusInfo.class}
        pill={pill}
        size={size}
        icon={withIcon ? icon : null}
        className={className}
        {...props}
      >
        {withDot && (
          <span className={`d-inline-block rounded-circle bg-${withDot === true ? 'light' : withDot} me-1`} style={{ width: '6px', height: '6px' }}></span>
        )}
        {statusInfo.label}
      </Badge>
    );
  }
  
  // Default fallback
  return (
    <Badge
      variant="secondary"
      pill={pill}
      size={size}
      className={className}
      {...props}
    >
      {status || 'Unknown'}
    </Badge>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['monitor', 'incident']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  pill: PropTypes.bool,
  withDot: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  withIcon: PropTypes.bool,
  className: PropTypes.string
};

export default StatusBadge;