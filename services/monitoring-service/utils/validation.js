// services/monitoring-service/utils/validation.js

/**
 * Validate a URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
 exports.isValidUrl = (url) => {
    if (!url) return false;
    
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };
  
  /**
   * Validate a domain name
   * @param {string} domain - Domain to validate
   * @returns {boolean} Is valid domain
   */
  exports.isValidDomain = (domain) => {
    if (!domain) return false;
    
    // Simple regex for domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
  };
  
  /**
   * Validate an IP address
   * @param {string} ip - IP address to validate
   * @returns {boolean} Is valid IP address
   */
  exports.isValidIp = (ip) => {
    if (!ip) return false;
    
    // IPv4 regex
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };
  
  /**
   * Validate a port number
   * @param {number} port - Port number to validate
   * @returns {boolean} Is valid port
   */
  exports.isValidPort = (port) => {
    return Number.isInteger(port) && port > 0 && port <= 65535;
  };
  
  /**
   * Validate monitor creation/update data
   * @param {Object} data - Monitor data
   * @returns {Object} Validation result with isValid flag and errors
   */
  exports.validateMonitor = (data) => {
    const errors = [];
    
    // Check name
    if (!data.name || data.name.trim() === '') {
      errors.push('Name is required');
    }
    
    // Check type
    const validTypes = ['website', 'ssl', 'domain', 'ping', 'port', 'tcp', 'cron', 'keyword'];
    if (!data.type || !validTypes.includes(data.type)) {
      errors.push(`Type must be one of: ${validTypes.join(', ')}`);
    }
    
    // Validate fields based on monitor type
    if (data.type) {
      switch (data.type) {
        case 'website':
        case 'cron':
          if (!data.url || !this.isValidUrl(data.url)) {
            errors.push('Valid URL is required for this monitor type');
          }
          break;
          
        case 'keyword':
          if (!data.url || !this.isValidUrl(data.url)) {
            errors.push('Valid URL is required for this monitor type');
          }
          if (!data.keyword || data.keyword.trim() === '') {
            errors.push('Keyword is required for this monitor type');
          }
          break;
          
        case 'ssl':
        case 'domain':
          if (!data.domain || !this.isValidDomain(data.domain)) {
            errors.push('Valid domain is required for this monitor type');
          }
          break;
          
        case 'ping':
          if (!data.ip || (!this.isValidIp(data.ip) && !this.isValidDomain(data.ip))) {
            errors.push('Valid IP address or hostname is required for this monitor type');
          }
          break;
          
        case 'port':
        case 'tcp':
          if (!data.ip || (!this.isValidIp(data.ip) && !this.isValidDomain(data.ip))) {
            errors.push('Valid IP address or hostname is required for this monitor type');
          }
          if (!data.port || !this.isValidPort(data.port)) {
            errors.push('Valid port number (1-65535) is required for this monitor type');
          }
          break;
      }
    }
    
    // Validate interval
    if (data.interval !== undefined) {
      if (!Number.isInteger(data.interval) || data.interval < 1 || data.interval > 1440) {
        errors.push('Interval must be a number between 1 and 1440 minutes');
      }
    }
    
    // Validate timeout
    if (data.timeout !== undefined) {
      if (!Number.isInteger(data.timeout) || data.timeout < 1 || data.timeout > 120) {
        errors.push('Timeout must be a number between 1 and 120 seconds');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Sanitize monitor data
   * @param {Object} data - Monitor data to sanitize
   * @returns {Object} Sanitized monitor data
   */
  exports.sanitizeMonitorData = (data) => {
    const sanitized = { ...data };
    
    // Trim string fields
    if (sanitized.name) sanitized.name = sanitized.name.trim();
    if (sanitized.url) sanitized.url = sanitized.url.trim();
    if (sanitized.domain) sanitized.domain = sanitized.domain.trim();
    if (sanitized.ip) sanitized.ip = sanitized.ip.trim();
    if (sanitized.keyword) sanitized.keyword = sanitized.keyword.trim();
    
    // Convert numeric strings to numbers
    if (sanitized.port && typeof sanitized.port === 'string') {
      sanitized.port = parseInt(sanitized.port, 10);
    }
    if (sanitized.interval && typeof sanitized.interval === 'string') {
      sanitized.interval = parseInt(sanitized.interval, 10);
    }
    if (sanitized.timeout && typeof sanitized.timeout === 'string') {
      sanitized.timeout = parseInt(sanitized.timeout, 10);
    }
    if (sanitized.expectedStatus && typeof sanitized.expectedStatus === 'string') {
      sanitized.expectedStatus = parseInt(sanitized.expectedStatus, 10);
    }
    
    // Convert string boolean to actual boolean
    if (sanitized.active !== undefined && typeof sanitized.active === 'string') {
      sanitized.active = sanitized.active === 'true';
    }
    
    return sanitized;
  };