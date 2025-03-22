// frontend/src/pages/Notifications.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Alert, LoadingSpinner, EmptyState, Badge } from '../components/common';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        const res = await axios.get('/api/notifications', {
          params: { page: 1, limit: 20 }
        });
        
        setNotifications(res.data.notifications);
        setHasMore(res.data.hasMore);
        setPage(1);
      } catch (err) {
        setError('Failed to load notifications. Please try again.');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Load more notifications
  const loadMoreNotifications = async () => {
    try {
      setLoadingMore(true);
      
      const nextPage = page + 1;
      const res = await axios.get('/api/notifications', {
        params: { page: nextPage, limit: 20 }
      });
      
      setNotifications(prev => [...prev, ...res.data.notifications]);
      setHasMore(res.data.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more notifications:', err);
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to load more notifications. Please try again.'
      });
    } finally {
      setLoadingMore(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to mark notification as read. Please try again.'
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      
      await axios.put('/api/notifications/mark-all-read');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setAlert({
        show: true,
        type: 'success',
        message: 'All notifications marked as read.'
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to mark all notifications as read. Please try again.'
      });
    } finally {
      setMarkingAll(false);
    }
  };

  // Format notification time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'monitor_down':
        return 'exclamation-triangle-fill text-danger';
      case 'monitor_up':
        return 'check-circle-fill text-success';
      case 'ssl_expiring':
        return 'shield-exclamation text-warning';
      case 'domain_expiring':
        return 'globe text-warning';
      case 'incident_created':
        return 'flag-fill text-danger';
      case 'incident_updated':
        return 'flag text-primary';
      case 'incident_resolved':
        return 'check-square-fill text-success';
      default:
        return 'bell-fill text-primary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <LoadingSpinner size="lg" text="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="notifications">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Notifications</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Button
            variant="outline-secondary"
            icon="check-all"
            onClick={markAllAsRead}
            isLoading={markingAll}
            disabled={notifications.every(n => n.read)}
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      {alert.show && (
        <Alert
          variant={alert.type}
          dismissible
          onClose={() => setAlert({ show: false })}
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          message="You don't have any notifications yet. We'll notify you when there are updates about your monitors."
          icon="bell"
        />
      ) : (
        <div className="notification-list">
          {notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`notification-item card mb-3 ${!notification.read ? 'border-primary' : ''}`}
            >
              <div className="card-body d-flex">
                <div className="notification-icon me-3">
                  <i className={`bi ${getNotificationIcon(notification.type)} fs-3`}></i>
                </div>
                <div className="notification-content flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h5 className="mb-0">
                      {notification.title}
                      {!notification.read && (
                        <Badge variant="primary" pill className="ms-2">New</Badge>
                      )}
                    </h5>
                    <div className="text-muted small">
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                  <p className="mb-2">{notification.message}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {notification.monitorId && (
                        <Link 
                          to={`/monitors/${notification.monitorId}`}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          <i className="bi bi-graph-up me-1"></i>
                          View Monitor
                        </Link>
                      )}
                      {notification.incidentId && (
                        <Link 
                          to={`/incidents/${notification.incidentId}`}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          <i className="bi bi-flag me-1"></i>
                          View Incident
                        </Link>
                      )}
                    </div>
                    {!notification.read && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => markAsRead(notification._id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {hasMore && (
            <div className="text-center mt-3 mb-5">
              <Button
                variant="outline-primary"
                onClick={loadMoreNotifications}
                isLoading={loadingMore}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;