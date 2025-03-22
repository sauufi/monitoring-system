// services/monitoring-service/utils/checkers/websiteChecker.js
const axios = require('axios');
const { URL } = require('url');
const dns = require('dns').promises;

/**
 * Check if a domain resolves (pre-check)
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} True if domain resolves
 */
const domainResolves = async (url) => {
  try {
    const { hostname } = new URL(url);
    await dns.lookup(hostname);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = checkWebsite;;

/**
 * Check a website monitor
 * @param {object} monitor - Website monitor object
 * @returns {Promise<object>} Check result
 */
const checkWebsite = async (monitor) => {
  const startTime = Date.now();
  const headers = {};
  
  // Add custom user agent to avoid being blocked by some websites
  headers['User-Agent'] = 'Monitoring-System/1.0';
  
  try {
    // Pre-check: Verify that the domain resolves
    const domainResolvable = await domainResolves(monitor.url);
    if (!domainResolvable) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        message: 'Domain name could not be resolved',
        details: {
          error: 'DNS_RESOLUTION_FAILED',
          url: monitor.url
        }
      };
    }
    
    // Perform the actual HTTP request
    const response = await axios.get(monitor.url, {
      headers,
      timeout: (monitor.timeout || 30) * 1000, // Convert seconds to milliseconds
      validateStatus: null, // Don't throw on any status code
      maxRedirects: 5 // Limit redirects to prevent infinite loops
    });
    
    const responseTime = Date.now() - startTime;
    
    // Determine status based on the response
    let status, message;
    
    // If the monitor has a specific expected status code
    if (monitor.expectedStatus) {
      status = response.status === monitor.expectedStatus ? 'up' : 'down';
      message = status === 'up' 
        ? `Website returned expected status code: ${response.status}`
        : `Website returned unexpected status code: ${response.status}, expected: ${monitor.expectedStatus}`;
    } 
    // Otherwise, consider any 2xx or 3xx status as up
    else {
      status = (response.status >= 200 && response.status < 400) ? 'up' : 'down';
      message = status === 'up'
        ? `Website is up with status code: ${response.status}`
        : `Website returned error status code: ${response.status}`;
    }
    
    return {
      status,
      responseTime,
      statusCode: response.status,
      message,
      details: {
        url: monitor.url,
        method: 'GET',
        statusCode: response.status,
        statusText: response.statusText,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        redirects: response.request?._redirectable?._redirectCount || 0
      }
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Handle different types of errors
    let errorMessage = 'Unknown error occurred';
    let errorType = 'UNKNOWN_ERROR';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = `Connection timed out after ${monitor.timeout} seconds`;
      errorType = 'TIMEOUT';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
      errorType = 'CONNECTION_REFUSED';
    } else if (error.response) {
      // Request was made and server responded with a status code outside of 2xx
      errorMessage = `Website returned status code: ${error.response.status}`;
      errorType = 'HTTP_ERROR';
    } else if (error.request) {
      // Request was made but no response was received
      errorMessage = 'No response received from server';
      errorType = 'NO_RESPONSE';
    } else {
      // Something else happened
      errorMessage = error.message || 'Unknown error';
      errorType = 'REQUEST_ERROR';
    }
    
    return {
      status: 'down',
      responseTime,
      statusCode: error.response?.status,
      message: errorMessage,
      details: {
        error: errorType,
        errorMessage: error.message,
        url: monitor.url
      }
    };
  }
}