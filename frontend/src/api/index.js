// frontend/src/api/index.js
import axios from 'axios';

// Create axios instance with defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // If we're not already on the login page, redirect
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  verifyEmail: (token) => api.post('/api/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (userData) => api.put('/api/auth/profile', userData),
  changePassword: (passwords) => api.put('/api/auth/change-password', passwords)
};

// Monitors API calls
export const monitorsAPI = {
  getAll: () => api.get('/api/monitoring/monitors'),
  getById: (id) => api.get(`/api/monitoring/monitors/${id}`),
  create: (monitorData) => api.post('/api/monitoring/monitors', monitorData),
  update: (id, monitorData) => api.put(`/api/monitoring/monitors/${id}`, monitorData),
  delete: (id) => api.delete(`/api/monitoring/monitors/${id}`),
  getEvents: (id, params) => api.get(`/api/monitoring/monitors/${id}/events`, { params }),
  pauseMonitor: (id) => api.put(`/api/monitoring/monitors/${id}/pause`),
  resumeMonitor: (id) => api.put(`/api/monitoring/monitors/${id}/resume`),
  runCheck: (id) => api.post(`/api/monitoring/monitors/${id}/check`),
  getUptime: (id, period) => api.get(`/api/monitoring/monitors/${id}/uptime`, { params: { period } })
};

// Notifications API calls
export const notificationsAPI = {
  getChannels: () => api.get('/api/notifications/channels'),
  createChannel: (channelData) => api.post('/api/notifications/channels', channelData),
  updateChannel: (id, channelData) => api.put(`/api/notifications/channels/${id}`, channelData),
  deleteChannel: (id) => api.delete(`/api/notifications/channels/${id}`),
  getNotifications: (params) => api.get('/api/notifications', { params }),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`)
};

// Status Pages API calls
export const statusPagesAPI = {
  getAll: () => api.get('/api/status-pages'),
  getById: (id) => api.get(`/api/status-pages/${id}`),
  create: (pageData) => api.post('/api/status-pages', pageData),
  update: (id, pageData) => api.put(`/api/status-pages/${id}`, pageData),
  delete: (id) => api.delete(`/api/status-pages/${id}`),
  getMonitors: (id) => api.get(`/api/status-pages/${id}/monitors`),
  addMonitor: (id, monitorData) => api.post(`/api/status-pages/${id}/monitors`, monitorData),
  removeMonitor: (pageId, monitorId) => api.delete(`/api/status-pages/${pageId}/monitors/${monitorId}`),
  getIncidents: (id) => api.get(`/api/status-pages/${id}/incidents`),
  createIncident: (id, incidentData) => api.post(`/api/status-pages/${id}/incidents`, incidentData),
  updateIncident: (id, updateData) => api.post(`/api/incidents/${id}/updates`, updateData)
};

// Public Status Page API calls (no authentication required)
export const publicAPI = {
  getStatusPage: (slug) => axios.get(`/public/status-pages/${slug}`),
  getIncidents: (slug) => axios.get(`/public/status-pages/${slug}/incidents`)
};

// Dashboard API calls
export const dashboardAPI = {
  getStats: () => api.get('/api/monitoring/stats'),
  getUptimeOverview: (period) => api.get('/api/monitoring/uptime', { params: { period } })
};

export default {
  auth: authAPI,
  monitors: monitorsAPI,
  notifications: notificationsAPI,
  statusPages: statusPagesAPI,
  public: publicAPI,
  dashboard: dashboardAPI
};