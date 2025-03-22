// frontend/src/components/common/EmptyState.js
import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

/**
 * EmptyState component - displayed when there's no data to show
 */
const EmptyState = ({
  title = 'No data found',
  message = 'There are no items to display at this time.',
  icon = 'inbox',
  action = null,
  actionLink = null,
  actionText = 'Get Started',
  actionVariant = 'primary',
  compact = false,
  className = '',
  ...props
}) => {
  return (
    <div 
      className={`text-center py-${compact ? 3 : 5} ${className}`}
      {...props}
    >
      <div className={`mb-${compact ? 2 : 4}`}>
        <i className={`bi bi-${icon} text-muted ${compact ? 'fs-1' : 'display-1'}`}></i>
      </div>
      
      <h4 className={`mb-${compact ? 1 : 3}`}>{title}</h4>
      
      <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
        {message}
      </p>
      
      {action && (
        <Button
          variant={actionVariant}
          onClick={action}
          className="mt-2"
        >
          {actionText}
        </Button>
      )}
      
      {actionLink && !action && (
        <Button
          variant={actionVariant}
          to={actionLink}
          className="mt-2"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

// Predefined variants for common empty states
EmptyState.NoResults = (props) => (
  <EmptyState
    title="No results found"
    message="We couldn't find any results matching your search criteria. Try adjusting your filters or search terms."
    icon="search"
    {...props}
  />
);

EmptyState.NoMonitors = (props) => (
  <EmptyState
    title="No monitors yet"
    message="You haven't created any monitors yet. Create your first monitor to start tracking uptime and performance."
    icon="display"
    actionText="Add Your First Monitor"
    actionLink="/monitors/add"
    {...props}
  />
);

EmptyState.NoStatusPages = (props) => (
  <EmptyState
    title="No status pages"
    message="You haven't created any status pages yet. Create your first status page to share your service status with your users."
    icon="layout-text-window"
    actionText="Create Status Page"
    actionLink="/status-pages/add"
    {...props}
  />
);

EmptyState.NoNotifications = (props) => (
  <EmptyState
    title="No notifications"
    message="You don't have any notifications at the moment. We'll notify you here when there are important updates."
    icon="bell"
    {...props}
  />
);

EmptyState.NoIncidents = (props) => (
  <EmptyState
    title="No incidents"
    message="There are no incidents to report. Everything is working as expected."
    icon="check-circle"
    {...props}
  />
);

EmptyState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  icon: PropTypes.string,
  action: PropTypes.func,
  actionLink: PropTypes.string,
  actionText: PropTypes.string,
  actionVariant: PropTypes.string,
  compact: PropTypes.bool,
  className: PropTypes.string
};

export default EmptyState;