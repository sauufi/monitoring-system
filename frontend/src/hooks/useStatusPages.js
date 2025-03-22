// frontend/src/hooks/useStatusPages.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for fetching and managing status pages
 * @returns {object} Status pages data and operations
 */
const useStatusPages = () => {
  const [statusPages, setStatusPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch status pages from API
  useEffect(() => {
    const fetchStatusPages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/status-pages');
        setStatusPages(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch status pages');
        console.error('Error fetching status pages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusPages();
  }, [refreshTrigger]);

  // Refresh status pages list
  const refreshStatusPages = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Get a single status page by ID
  const getStatusPage = useCallback((id) => {
    return statusPages.find(page => page._id === id);
  }, [statusPages]);

  // Get a status page by slug
  const getStatusPageBySlug = useCallback((slug) => {
    return statusPages.find(page => page.slug === slug);
  }, [statusPages]);

  // Add a new status page
  const addStatusPage = useCallback(async (pageData) => {
    try {
      const response = await axios.post('/api/status-pages', pageData);
      setStatusPages(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add status page');
    }
  }, []);

  // Update an existing status page
  const updateStatusPage = useCallback(async (id, pageData) => {
    try {
      const response = await axios.put(`/api/status-pages/${id}`, pageData);
      setStatusPages(prev => 
        prev.map(page => 
          page._id === id ? response.data : page
        )
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update status page');
    }
  }, []);

  // Delete a status page
  const deleteStatusPage = useCallback(async (id) => {
    try {
      await axios.delete(`/api/status-pages/${id}`);
      setStatusPages(prev => prev.filter(page => page._id !== id));
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete status page');
    }
  }, []);

  // Toggle status page visibility (public/private)
  const toggleStatusPageVisibility = useCallback(async (id) => {
    try {
      const statusPage = statusPages.find(page => page._id === id);
      if (!statusPage) {
        throw new Error('Status page not found');
      }
      
      const response = await axios.put(`/api/status-pages/${id}`, {
        isPublic: !statusPage.isPublic
      });
      
      setStatusPages(prev => 
        prev.map(page => 
          page._id === id ? { ...page, isPublic: response.data.isPublic } : page
        )
      );
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to toggle visibility');
    }
  }, [statusPages]);

  // Add monitor to status page
  const addMonitorToStatusPage = useCallback(async (pageId, monitorData) => {
    try {
      const response = await axios.post(`/api/status-pages/${pageId}/monitors`, monitorData);
      
      // Update the status page in the list
      setStatusPages(prev => 
        prev.map(page => {
          if (page._id === pageId) {
            const updatedMonitors = [...(page.monitors || []), response.data._id];
            return { ...page, monitors: updatedMonitors };
          }
          return page;
        })
      );
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add monitor to status page');
    }
  }, []);

  // Remove monitor from status page
  const removeMonitorFromStatusPage = useCallback(async (pageId, monitorId) => {
    try {
      await axios.delete(`/api/status-pages/${pageId}/monitors/${monitorId}`);
      
      // Update the status page in the list
      setStatusPages(prev => 
        prev.map(page => {
          if (page._id === pageId) {
            const updatedMonitors = (page.monitors || []).filter(id => id !== monitorId);
            return { ...page, monitors: updatedMonitors };
          }
          return page;
        })
      );
      
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to remove monitor from status page');
    }
  }, []);

  // Create an incident for a status page
  const createIncident = useCallback(async (pageId, incidentData) => {
    try {
      const response = await axios.post(`/api/status-pages/${pageId}/incidents`, incidentData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create incident');
    }
  }, []);

  // Update an incident status
  const updateIncident = useCallback(async (incidentId, updateData) => {
    try {
      const response = await axios.post(`/api/incidents/${incidentId}/updates`, updateData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update incident');
    }
  }, []);

  // Get public status page by slug
  const getPublicStatusPage = useCallback(async (slug) => {
    try {
      const response = await axios.get(`/public/status-pages/${slug}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to get public status page');
    }
  }, []);

  return {
    statusPages,
    loading,
    error,
    refreshStatusPages,
    getStatusPage,
    getStatusPageBySlug,
    addStatusPage,
    updateStatusPage,
    deleteStatusPage,
    toggleStatusPageVisibility,
    addMonitorToStatusPage,
    removeMonitorFromStatusPage,
    createIncident,
    updateIncident,
    getPublicStatusPage
  };
};

export default useStatusPages;