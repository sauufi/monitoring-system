// frontend/src/components/monitors/AddMonitor.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AddMonitor = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
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

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      // Form validation
      if (!name.trim()) {
        throw new Error('Name is required');
      }

      // URL validation for website and keyword types
      if ((type === 'website' || type === 'keyword' || type === 'cron') && !url.trim()) {
        throw new Error('URL is required for this monitor type');
      }

      // Domain validation for SSL and domain types
      if ((type === 'ssl' || type === 'domain') && !domain.trim()) {
        throw new Error('Domain is required for this monitor type');
      }

      // IP validation for ping, port, and TCP types
      if ((type === 'ping' || type === 'port' || type === 'tcp') && !ip.trim()) {
        throw new Error('IP or hostname is required for this monitor type');
      }

      // Port validation for port and TCP types
      if ((type === 'port' || type === 'tcp') && !port) {
        throw new Error('Port is required for this monitor type');
      }

      // Keyword validation for keyword type
      if (type === 'keyword' && !keyword.trim()) {
        throw new Error('Keyword is required for this monitor type');
      }

      // Create monitor
      const res = await axios.post('/api/monitoring/monitors', formData);
      
      // Redirect to monitor details page
      navigate(`/monitors/${res.data._id}`);
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: err.response?.data?.message || err.message
      });
      setLoading(false);
    }
  };

  return (
    <div className="add-monitor">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Add Monitor</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link to="/monitors" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left"></i> Back to Monitors
          </Link>
        </div>
      </div>

      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false })}></button>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
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
              <Link to="/monitors" className="btn btn-outline-secondary me-md-2">Cancel</Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  'Create Monitor'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMonitor;