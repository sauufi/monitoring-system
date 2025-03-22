// frontend/src/utils/validators.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
 export const isValidEmail = (email) => {
  if (!email) return false;
  
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate hostname format (domain or IP)
 * @param {string} hostname - Hostname to validate
 * @returns {boolean} True if valid hostname
 */
export const isValidHostname = (hostname) => {
  if (!hostname) return false;
  
  // Domain name validation
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // IPv4 validation
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  
  // IPv6 validation
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])$/;
  
  if (domainRegex.test(hostname)) return true;
  
  if (ipv4Regex.test(hostname)) {
    // Check if each octet is <= 255
    const octets = hostname.split('.');
    return octets.every(octet => parseInt(octet) <= 255);
  }
  
  return ipv6Regex.test(hostname);
};

/**
 * Validate port number
 * @param {number|string} port - Port to validate
 * @returns {boolean} True if valid port
 */
export const isValidPort = (port) => {
  if (port === null || port === undefined || port === '') return false;
  
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with strength level and message
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return { valid: false, strength: 0, message: 'Password cannot be empty' };
  }
  
  let strength = 0;
  let message = '';
  
  // Check length
  if (password.length < 8) {
    return { valid: false, strength: 0, message: 'Password must be at least 8 characters long' };
  } else {
    strength += 1;
  }
  
  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    strength += 1;
  }
  
  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    strength += 1;
  }
  
  // Check for numbers
  if (/[0-9]/.test(password)) {
    strength += 1;
  }
  
  // Check for special characters
  if (/[^A-Za-z0-9]/.test(password)) {
    strength += 1;
  }
  
  // Set message based on strength
  if (strength <= 2) {
    message = 'Password is weak';
    return { valid: true, strength: 1, message };
  } else if (strength <= 4) {
    message = 'Password is medium strength';
    return { valid: true, strength: 2, message };
  } else {
    message = 'Password is strong';
    return { valid: true, strength: 3, message };
  }
};

/**
 * Validate login form
 * @param {object} values - Form values
 * @returns {object} Validation errors
 */
export const validateLoginForm = (values) => {
  const errors = {};
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Invalid email address';
  }
  
  if (!values.password) {
    errors.password = 'Password is required';
  }
  
  return errors;
};

/**
 * Validate registration form
 * @param {object} values - Form values
 * @returns {object} Validation errors
 */
export const validateRegisterForm = (values) => {
  const errors = {};
  
  if (!values.name) {
    errors.name = 'Name is required';
  }
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Invalid email address';
  }
  
  if (!values.password) {
    errors.password = 'Password is required';
  } else {
    const passwordCheck = validatePasswordStrength(values.password);
    if (!passwordCheck.valid) {
      errors.password = passwordCheck.message;
    }
  }
  
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};

/**
 * Validate monitor form
 * @param {object} values - Form values
 * @returns {object} Validation errors
 */
export const validateMonitorForm = (values) => {
  const errors = {};
  
  if (!values.name) {
    errors.name = 'Name is required';
  }
  
  switch (values.type) {
    case 'website':
    case 'cron':
      if (!values.url) {
        errors.url = 'URL is required';
      } else if (!isValidUrl(values.url)) {
        errors.url = 'Invalid URL format';
      }
      break;
      
    case 'keyword':
      if (!values.url) {
        errors.url = 'URL is required';
      } else if (!isValidUrl(values.url)) {
        errors.url = 'Invalid URL format';
      }
      if (!values.keyword) {
        errors.keyword = 'Keyword is required';
      }
      break;
      
    case 'ssl':
    case 'domain':
      if (!values.domain) {
        errors.domain = 'Domain is required';
      } else if (!isValidHostname(values.domain)) {
        errors.domain = 'Invalid domain format';
      }
      break;
      
    case 'ping':
      if (!values.ip) {
        errors.ip = 'IP or hostname is required';
      } else if (!isValidHostname(values.ip)) {
        errors.ip = 'Invalid IP or hostname format';
      }
      break;
      
    case 'port':
    case 'tcp':
      if (!values.ip) {
        errors.ip = 'IP or hostname is required';
      } else if (!isValidHostname(values.ip)) {
        errors.ip = 'Invalid IP or hostname format';
      }
      if (!values.port) {
        errors.port = 'Port is required';
      } else if (!isValidPort(values.port)) {
        errors.port = 'Invalid port number (1-65535)';
      }
      break;
      
    default:
      break;
  }
  
  if (!values.interval) {
    errors.interval = 'Check interval is required';
  } else if (isNaN(values.interval) || values.interval < 1) {
    errors.interval = 'Invalid interval value';
  }
  
  if (!values.timeout) {
    errors.timeout = 'Timeout is required';
  } else if (isNaN(values.timeout) || values.timeout < 1) {
    errors.timeout = 'Invalid timeout value';
  }
  
  return errors;
};