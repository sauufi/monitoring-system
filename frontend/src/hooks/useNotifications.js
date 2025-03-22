// frontend/src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for fetching and managing notifications
 * @returns {object} Notifications data and operations
 */
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/notifications', {
          params: { page: 1, limit: 20 }
        });
        
        setNotifications(response.data.notifications || []);
        setHasMore(response.data.hasMore || false);
        setPage(1);
        
        // Count unread notifications
        const unread = (response.data.notifications || []).filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [refreshTrigger]);

  // Refresh notifications list
  const refreshNotifications = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    try {
      const nextPage = page + 1;
      const response = await axios.get('/api/notifications', {
        params: { page: nextPage, limit: 20 }
      });
      
      if (response.data.notifications && response.data.notifications.length > 0) {
        setNotifications(prev => [...prev, ...response.data.notifications]);
        setPage(nextPage);
        setHasMore(response.data.hasMore || false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more notifications:', err);
    }
  }, [hasMore, loading, page]);

  // Mark a notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      
      // Update notification in state
      setNotifications(prev => 
        prev.map(notification => {
          if (notification._id === id && !notification.read) {
            setUnreadCount(count => count - 1);
            return { ...notification, read: true };
          }
          return notification;
        })
      );
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      
      // Update all notifications in state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  // Get notification channels
  const getChannels = useCallback(async () => {
    try {
      const response = await axios.get('/api/notifications/channels');
      return response.data;
    } catch (err) {
      console.error('Error fetching notification channels:', err);
      throw new Error(err.response?.data?.message || 'Failed to fetch channels');
    }
  }, []);

  // Add notification channel
  const addChannel = useCallback(async (channelData) => {
    try {
      const response = await axios.post('/api/notifications/channels', channelData);
      return response.data;
    } catch (err) {
      console.error('Error adding notification channel:', err);
      throw new Error(err.response?.data?.message || 'Failed to add channel');
    }
  }, []);

  // Update notification channel
  const updateChannel = useCallback(async (id, channelData) => {
    try {
      const response = await axios.put(`/api/notifications/channels/${id}`, channelData);
      return response.data;
    } catch (err) {
      console.error('Error updating notification channel:', err);
      throw new Error(err.response?.data?.message || 'Failed to update channel');
    }
  }, []);

  // Delete notification channel
  const deleteChannel = useCallback(async (id) => {
    try {
      await axios.delete(`/api/notifications/channels/${id}`);
      return true;
    } catch (err) {
      console.error('Error deleting notification channel:', err);
      throw new Error(err.response?.data?.message || 'Failed to delete channel');
    }
  }, []);

  // Test notification channel
  const testChannel = useCallback(async (id) => {
    try {
      const response = await axios.post(`/api/notifications/channels/${id}/test`);
      return response.data;
    } catch (err) {
      console.error('Error testing notification channel:', err);
      throw new Error(err.response?.data?.message || 'Failed to test channel');
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    hasMore,
    refreshNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    getChannels,
    addChannel,
    updateChannel,
    deleteChannel,
    testChannel
  };
};

export default useNotifications;