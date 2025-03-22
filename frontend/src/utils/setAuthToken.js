// frontend/src/utils/setAuthToken.js
import axios from 'axios';

/**
 * Sets or removes the authentication token in axios headers
 * @param {string|null} token - JWT token or null to remove
 */
export const setAuthToken = (token) => {
  if (token) {
    // Set token in axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Store token in localStorage
    localStorage.setItem('token', token);
  } else {
    // Remove token from axios defaults
    delete axios.defaults.headers.common['Authorization'];
    // Remove token from localStorage
    localStorage.removeItem('token');
  }
};