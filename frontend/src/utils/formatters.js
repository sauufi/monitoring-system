// frontend/src/utils/formatters.js

/**
 * Format a date to a human-readable string
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
 export const formatDate = (date, includeTime = true) => {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    
    // Check if date is valid
    if (isNaN(d.getTime())) return 'Invalid date';
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    };
    
    return d.toLocaleDateString(undefined, options);
  };
  
  /**
   * Format duration in milliseconds to a human-readable string
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration string
   */
  export const formatDuration = (ms) => {
    if (!ms || isNaN(ms)) return 'N/A';
    
    if (ms < 1000) {
      return `${ms}ms`;
    }
    
    if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(1);
    
    return `${minutes}m ${seconds}s`;
  };
  
  /**
   * Format a number as a percentage with specified decimals
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage string
   */
  export const formatPercentage = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    
    return `${value.toFixed(decimals)}%`;
  };
  
  /**
   * Format a number with thousands separators
   * @param {number} value - Value to format
   * @returns {string} Formatted number string
   */
  export const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  /**
   * Format a file size in bytes to a human-readable string (KB, MB, GB)
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted file size string
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    if (!bytes || isNaN(bytes)) return 'N/A';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  };
  
  /**
   * Truncate a string to a specified length and add ellipsis
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated string
   */
  export const truncateString = (str, length = 30) => {
    if (!str) return '';
    
    if (str.length <= length) return str;
    
    return `${str.substring(0, length)}...`;
  };
  
  /**
   * Format a URL for display (remove protocol, www, trailing slash)
   * @param {string} url - URL to format
   * @returns {string} Formatted URL
   */
  export const formatUrl = (url) => {
    if (!url) return '';
    
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  };
  
  /**
   * Format a monitor type to a readable label
   * @param {string} type - Monitor type
   * @returns {string} Formatted monitor type
   */
  export const formatMonitorType = (type) => {
    if (!type) return '';
    
    const types = {
      website: 'Website',
      ssl: 'SSL Certificate',
      domain: 'Domain',
      ping: 'Ping',
      port: 'Port',
      tcp: 'TCP',
      cron: 'Cron Job',
      keyword: 'Keyword'
    };
    
    return types[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  /**
   * Format a monitor status to a readable label and class
   * @param {string} status - Monitor status
   * @returns {object} Formatted status with label and class
   */
  export const formatMonitorStatus = (status) => {
    if (!status) return { label: 'Unknown', class: 'secondary' };
    
    const statuses = {
      up: { label: 'Up', class: 'success' },
      down: { label: 'Down', class: 'danger' },
      pending: { label: 'Pending', class: 'warning' },
      paused: { label: 'Paused', class: 'secondary' }
    };
    
    return statuses[status] || { label: status.charAt(0).toUpperCase() + status.slice(1), class: 'secondary' };
  };
  
  /**
   * Format an incident status to a readable label and class
   * @param {string} status - Incident status
   * @returns {object} Formatted status with label and class
   */
  export const formatIncidentStatus = (status) => {
    if (!status) return { label: 'Unknown', class: 'secondary' };
    
    const statuses = {
      investigating: { label: 'Investigating', class: 'warning' },
      identified: { label: 'Identified', class: 'info' },
      monitoring: { label: 'Monitoring', class: 'primary' },
      resolved: { label: 'Resolved', class: 'success' }
    };
    
    return statuses[status] || { label: status.charAt(0).toUpperCase() + status.slice(1), class: 'secondary' };
  };