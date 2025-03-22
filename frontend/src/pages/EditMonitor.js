// frontend/src/pages/EditMonitor.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, LoadingSpinner, Alert } from '../components/common';

const EditMonitor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
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

  // Fetch monitor data
  useEffect(() => {
    const fetchMonitor = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/monitoring/monitors/${id}`);
        // Populate form with monitor data
        setFormData({
          name: res.data.name || '',
          type: res.data.type || 'website',
          url: res.data.url || '',
          domain: res.data.domain || '',
          ip: res.data.ip || '',
          port: res.data.port || '',
          keyword: res.data.keyword || '',
          expectedStatus: res.data.expectedStatus || 200,
          interval: res.data.interval || 5,
          timeout: res.data.timeout || 30,
          active: res.data.active !== undefined ? res.data.active : true
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load monitor. It may have been deleted or you may not have permission to access it.');
        setLoading(false);
      }
    };

    fetchMonitor();
  }, [id]);

  // Handle input change
  const handleChange = e => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData({
      ...formData,
      [name]: inputType === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setAlert({ show: false });
      
      // Form validation
      let validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setAlert({
          show: true,
          type: 'danger',
          message: Object.values(validationErrors)[0] // Show first validation error
        });
        setSubmitting(false);
        return;
      }

      // Submit form data
      await axios.put(`/api/monitoring/monitors/${id}`, formData);
      
      // Show success message and redirect
      setAlert({
        show: true,
        type: 'success',
        message: 'Monitor updated successfully!'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/monitors/${id}`);
      }, 1500);
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update monitor. Please try again.'
      });
      setSubmitting(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    // URL validation for website and keyword types
    if ((type === 'website' || type === 'keyword' || type === 'cron') && !url.trim()) {
      errors.url = 'URL is required for this monitor type';
    }

    // Domain validation for SSL and domain types
    if ((type === 'ssl' || type === 'domain') && !domain.trim()) {
      errors.domain = 'Domain is required for this monitor type';
    }

    // IP validation for ping, port, and TCP types
    if ((type === 'ping' || type === 'port' || type === 'tcp') && !ip.trim()) {
      errors.ip = 'IP or hostname is required for this monitor type';
    }

    // Port validation for port and TCP types
    if ((type === 'port' || type === 'tcp') && !port) {
      errors.port = 'Port is required for this monitor type';
    }

    // Keyword validation for keyword type
    if (type === 'keyword' && !keyword.trim()) {
      errors.keyword = 'Keyword is required for this monitor type';
    }

    return errors;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <LoadingSpinner size="lg" text="Loading monitor details..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        title="Error Loading Monitor"
        dismissible={false}
        className="mt-4"
      >
        {error}
        <div className="mt-3">
          <Button
            to="/monitors"
            variant="outline-primary"
            icon="arrow-left"
          >
            Back to Monitors
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="edit-monitor">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Edit Monitor</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link to={`/monitors/${id}`} className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> Back to Monitor
          </Link>
        </div>
      </div>

      {alert.show && (
        <Alert
          variant={alert.type}
          dismissible
          onClose={() => setAlert({ show: false })}
          className="mb-4"
        >
          {alert.message}
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
                disabled  // Type cannot be changed after creation
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
              <div className="form-text">Monitor type cannot be changed after creation</div>
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
              <label htmlFor="interval" className="form-label">Check Interval (minutes)</label>
              <input
                type="number"
                className="form-control"
                id="interval"
                name="interval"
                value={interval}
                onChange={handleChange}
                min="1"
                max="1440"
              />
              <div className="form-text">How often the monitor should check the target</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="timeout" className="form-label">Timeout (seconds)</label>
              <input
                type="number"
                className="form-control"
                id="timeout"
                name="timeout"
                value={timeout}
                onChange={handleChange}
                min="1"
                max="120"
              />
              <div className="form-text">How long to wait for a response before timing out</div>
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
            <Link to={`/monitors/${id}`} className="btn btn-outline-secondary me-md-2">Cancel</Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditMonitor;