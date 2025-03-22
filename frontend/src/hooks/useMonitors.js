// frontend/src/hooks/useMonitors.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for fetching and managing monitors
 * @returns {object} Monitors data and operations
 */
const useMonitors = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch monitors from API
  useEffect(() => {
    const fetchMonitors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/monitoring/monitors');
        setMonitors(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch monitors');
        console.error('Error fetching monitors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonitors();
  }, [refreshTrigger]);

  // Refresh monitors list
  const refreshMonitors = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Get a single monitor by ID
  const getMonitor = useCallback((id) => {
    return monitors.find(monitor => monitor._id === id);
  }, [monitors]);

  // Add a new monitor
  const addMonitor = useCallback(async (monitorData) => {
    try {
      const response = await axios.post('/api/monitoring/monitors', monitorData);
      setMonitors(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add monitor');
    }
  }, []);

  // Update an existing monitor
  const updateMonitor = useCallback(async (id, monitorData) => {
    try {
      const response = await axios.put(`/api/monitoring/monitors/${id}`, monitorData);
      setMonitors(prev => 
        prev.map(monitor => 
          monitor._id === id ? response.data : monitor
        )
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update monitor');
    }
  }, []);

  // Delete a monitor
  const deleteMonitor = useCallback(async (id) => {
    try {
      await axios.delete(`/api/monitoring/monitors/${id}`);
      setMonitors(prev => prev.filter(monitor => monitor._id !== id));
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete monitor');
    }
  }, []);

  // Pause a monitor
  const pauseMonitor = useCallback(async (id) => {
    try {
      const response = await axios.put(`/api/monitoring/monitors/${id}/pause`);
      setMonitors(prev => 
        prev.map(monitor => 
          monitor._id === id ? { ...monitor, active: false } : monitor
        )
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to pause monitor');
    }
  }, []);

  // Resume a monitor
  const resumeMonitor = useCallback(async (id) => {
    try {
      const response = await axios.put(`/api/monitoring/monitors/${id}/resume`);
      setMonitors(prev => 
        prev.map(monitor => 
          monitor._id === id ? { ...monitor, active: true } : monitor
        )
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to resume monitor');
    }
  }, []);

  // Run a check on a monitor
  const runCheck = useCallback(async (id) => {
    try {
      const response = await axios.post(`/api/monitoring/monitors/${id}/check`);
      
      // Update monitor status in the list
      setMonitors(prev => 
        prev.map(monitor => 
          monitor._id === id ? { 
            ...monitor, 
            status: response.data.status,
            lastChecked: response.data.lastChecked
          } : monitor
        )
      );
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to run check');
    }
  }, []);

  // Filter monitors by status
  const filterByStatus = useCallback((status) => {
    if (status === 'all') return monitors;
    return monitors.filter(monitor => monitor.status === status);
  }, [monitors]);

  // Filter monitors by type
  const filterByType = useCallback((type) => {
    if (type === 'all') return monitors;
    return monitors.filter(monitor => monitor.type === type);
  }, [monitors]);

  // Search monitors by name
  const searchByName = useCallback((searchTerm) => {
    if (!searchTerm) return monitors;
    const lowercaseSearch = searchTerm.toLowerCase();
    return monitors.filter(monitor => 
      monitor.name.toLowerCase().includes(lowercaseSearch)
    );
  }, [monitors]);

  return {
    monitors,
    loading,
    error,
    refreshMonitors,
    getMonitor,
    addMonitor,
    updateMonitor,
    deleteMonitor,
    pauseMonitor,
    resumeMonitor,
    runCheck,
    filterByStatus,
    filterByType,
    searchByName
  };
};

export default useMonitors;