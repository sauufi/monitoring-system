// frontend/src/utils/formatUtils.js
import moment from 'moment';

/**
 * Format date to a readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (default: 'DD MMM YYYY, HH:mm:ss')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'DD MMM YYYY, HH:mm:ss') => {
  if (!date) return 'N/A';
  return moment(date).format(format);
};

/**
 * Format time difference relative to now
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  return moment(date).fromNow();
};

/**
 * Format uptime percentage
 * @param {number} uptime - Uptime percentage
 * @returns {string} Formatted percentage with 2 decimal places
 */
export const formatUptime = (uptime) => {
  if (uptime === undefined || uptime === null) return 'N/A';
  return `${uptime.toFixed(2)}%`;
};

/**
 * Format response time with appropriate units
 * @param {number} responseTime - Response time in milliseconds
 * @returns {string} Formatted response time
 */
export const formatResponseTime = (responseTime) => {
  if (responseTime === undefined || responseTime === null) return 'N/A';
  
  // Format based on the value
  if (responseTime < 1000) {
    return `${responseTime}ms`;
  } else {
    return `${(responseTime / 1000).toFixed(2)}s`;
  }
};

/**
 * Get appropriate CSS class for status
 * @param {string} status - Status (up, down, pending)
 * @returns {string} CSS class name
 */
export const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'up':
      return 'text-success';
    case 'down':
      return 'text-danger';
    case 'pending':
      return 'text-warning';
    default:
      return 'text-secondary';
  }
};

/**
 * Get appropriate status badge class
 * @param {string} status - Status (up, down, pending)
 * @returns {string} Badge CSS class name
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'up':
      return 'bg-success';
    case 'down':
      return 'bg-danger';
    case 'pending':
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
};

/**
 * Get appropriate icon class for monitor type
 * @param {string} type - Monitor type
 * @returns {string} Icon CSS class name
 */
export const getMonitorTypeIcon = (type) => {
  switch (type) {
    case 'website':
      return 'bi-globe';
    case 'ssl':
      return 'bi-shield-lock';
    case 'domain':
      return 'bi-hdd-network';
    case 'ping':
      return 'bi-reception-4';
    case 'port':
      return 'bi-ethernet';
    case 'tcp':
      return 'bi-diagram-3';
    case 'cron':
      return 'bi-clock-history';
    case 'keyword':
      return 'bi-search';
    default:
      return 'bi-question-circle';
  }
};