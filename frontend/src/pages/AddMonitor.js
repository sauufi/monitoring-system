// frontend/src/pages/AddMonitor.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Alert } from '../components/common';

const AddMonitor = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'website',
    url: '',
    domain: '',
    ip: '',
    port: '',
    keyword: '',
    expectedStatus: 200,
    interval: 5,
    timeout: 30,
    active: true
  });

  // Destructure form data
  const {
    name, type, url, domain, ip, port, keyword, expectedStatus, interval, timeout, active
  } = formData;

  // Handle input change
  const handleChange = e => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData({
      ...formData,
      [name]: inputType === 'checkbox' ? checked : value
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Validate name
    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    // Type-specific validation
    switch (type) {
      case 'website':
      case 'cron':
        if (!url.trim()) {
          errors.url = 'URL is required for this monitor type';
        } else if (!/^https?:\/\/.+/.test(url)) {
          errors.url = 'URL must start with http:// or https://';
        }
        break;
      
      case 'keyword':
        if (!url.trim()) {
          errors.url = 'URL is required for this monitor type';
        } else if (!/^https?:\/\/.+/.test(url)) {
          errors.url = 'URL must start with http:// or https://';
        }
        if (!keyword.trim()) {
          errors.keyword = 'Keyword is required for this monitor type';
        }
        break;
      
      case 'ssl':
      case 'domain':
        if (!domain.trim()) {
          errors.domain = 'Domain is required for this monitor type';
        }
        break;
      
      case 'ping':
        if (!ip.trim()) {
          errors.ip = 'IP or hostname is required for this monitor type';
        }
        break;
      
      case 'port':
      case 'tcp':
        if (!ip.trim()) {
          errors.ip = 'IP or hostname is required for this monitor type';
        }
        if (!port) {
          errors.port = 'Port is required for this monitor type';
        } else {
          const portNum = parseInt(port, 10);
          if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            errors.port = 'Port must be a number between 1 and 65535';
          }
        }
        break;
      
      default:
        break;
    }

    // Validate interval
    if (!interval) {
      errors.interval = 'Check interval is required';
    } else {
      const intervalNum = parseInt(interval, 10);
      if (isNaN(intervalNum) || intervalNum < 1 || intervalNum > 1440) {
        errors.interval = 'Interval must be a number between 1 and 1440';
      }
    }

    // Validate timeout
    if (!timeout) {
      errors.timeout = 'Timeout is required';
    } else {
      const timeoutNum = parseInt(timeout, 10);
      if (isNaN(timeoutNum) || timeoutNum < 1 || timeoutNum > 120) {
        errors.timeout = 'Timeout must be a number between 1 and 120';
      }
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Create monitor
      const res = await axios.post('/api/monitoring/monitors', formData);
      
      // Redirect to monitor details page
      navigate(`/monitors/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create monitor. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="add-monitor">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Add Monitor</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link to="/monitors" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> Back to Monitors
          </Link>
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError('')}
          className="mb-4"
        >
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-4">
            <h5 className="card-title">Basic Information</h5>
            
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Monitor Name *</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="e.g., Website Monitoring"
                required
              />
              <div className="form-text">A descriptive name for your monitor</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="type" className="form-label">Monitor Type *</label>
              <select
                className="form-select"
                id="type"
                name="type"
                value={type}
                onChange={handleChange}
                required
              >
                <option value="website">Website Monitoring</option>
                <option value="ssl">SSL Certificate Monitoring</option>
                <option value="domain">Domain Monitoring</option>
                <option value="ping">Ping Monitoring</option>
                <option value="port">Port Monitoring</option>
                <option value="tcp">TCP Monitoring</option>
                <option value="cron">Cron Job Monitoring</option>
                <option value="keyword">Keyword Monitoring</option>
              </select>
              <div className="form-text">Select the type of monitoring you want to perform</div>
            </div>
          </div>

          {/* Target Information */}
          <div className="mb-4">
            <h5 className="card-title">Target Information</h5>
            
            {/* Website, Cron Job, Keyword */}
            {(type === 'website' || type === 'cron' || type === 'keyword') && (
              <div className="mb-3">
                <label htmlFor="url" className="form-label">URL *</label>
                <input
                  type="url"
                  className="form-control"
                  id="url"
                  name="url"
                  value={url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  required
                />
                <div className="form-text">The complete URL to monitor</div>
              </div>
            )}
            
            {/* SSL, Domain */}
            {(type === 'ssl' || type === 'domain') && (
              <div className="mb-3">
                <label htmlFor="domain" className="form-label">Domain *</label>
                <input
                  type="text"
                  className="form-control"
                  id="domain"
                  name="domain"
                  value={domain}
                  onChange={handleChange}
                  placeholder="example.com"
                  required
                />
                <div className="form-text">The domain name to monitor</div>
              </div>
            )}
            
            {/* Ping, Port, TCP */}
            {(type === 'ping' || type === 'port' || type === 'tcp') && (
              <div className="mb-3">
                <label htmlFor="ip" className="form-label">IP Address / Hostname *</label>
                <input
                  type="text"
                  className="form-control"
                  id="ip"
                  name="ip"
                  value={ip}
                  onChange={handleChange}
                  placeholder="192.168.1.1 or server.example.com"
                  required
                />
                <div className="form-text">The IP address or hostname to monitor</div>
              </div>
            )}
            
            {/* Port, TCP */}
            {(type === 'port' || type === 'tcp') && (
              <div className="mb-3">
                <label htmlFor="port" className="form-label">Port *</label>
                <input
                  type="number"
                  className="form-control"
                  id="port"
                  name="port"
                  value={port}
                  onChange={handleChange}
                  placeholder="80"
                  min="1"
                  max="65535"
                  required
                />
                <div className="form-text">The port number to monitor</div>
              </div>
            )}
            
            {/* Keyword */}
            {type === 'keyword' && (
              <div className="mb-3">
                <label htmlFor="keyword" className="form-label">Keyword *</label>
                <input
                  type="text"
                  className="form-control"
                  id="keyword"
                  name="keyword"
                  value={keyword}
                  onChange={handleChange}
                  placeholder="Success"
                  required
                />
                <div className="form-text">The keyword to search for on the page</div>
              </div>
            )}
            
            {/* Website - Expected Status */}
            {type === 'website' && (
              <div className="mb-3">
                <label htmlFor="expectedStatus" className="form-label">Expected Status Code</label>
                <input
                  type="number"
                  className="form-control"
                  id="expectedStatus"
                  name="expectedStatus"
                  value={expectedStatus}
                  onChange={handleChange}
                  placeholder="200"
                />
                <div className="form-text">The HTTP status code you expect (leave empty to accept any 2xx or 3xx)</div>
              </div>
            )}
          </div>

          {/* Monitoring Settings */}
          <div className="mb-4">
            <h5 className="card-title">Monitoring Settings</h5>
            
            <div className="mb-3">
              <label htmlFor="interval" className="form-label">Check Interval (minutes) *</label>
              <input
                type="number"
                className="form-control"
                id="interval"
                name="interval"
                value={interval}
                onChange={handleChange}
                min="1"
                max="1440"
                required
              />
              <div className="form-text">How often the monitor should check the target (1-1440 minutes)</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="timeout" className="form-label">Timeout (seconds) *</label>
              <input
                type="number"
                className="form-control"
                id="timeout"
                name="timeout"
                value={timeout}
                onChange={handleChange}
                min="1"
                max="120"
                required
              />
              <div className="form-text">How long to wait for a response before timing out (1-120 seconds)</div>
            </div>
            
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="active"
                name="active"
                checked={active}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="active">Active</label>
              <div className="form-text">Enable or disable monitoring</div>
            </div>
          </div>

          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Link to="/monitors" className="btn btn-outline-secondary me-md-2">Cancel</Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
            >
              Create Monitor
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddMonitor;