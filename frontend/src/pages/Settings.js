// frontend/src/pages/Settings.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Button, Alert, LoadingSpinner, Modal } from '../components/common';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
  const { user, loadUser } = useContext(AuthContext);
  
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    defaultNotificationDelay: 5,
    useHttps: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  // API keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [generatingApiKey, setGeneratingApiKey] = useState(false);
  const [deletingApiKey, setDeletingApiKey] = useState(null);
  
  // Alert states
  const [generalAlert, setGeneralAlert] = useState({ show: false, type: '', message: '' });
  const [apiKeyAlert, setApiKeyAlert] = useState({ show: false, type: '', message: '' });
  
  // New API key modal
  const [showNewApiKey, setShowNewApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null);
  
  // Available timezones
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];

  // Fetch settings and API keys
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // Fetch user settings
        const settingsRes = await axios.get('/api/settings');
        if (settingsRes.data) {
          setGeneralSettings(prev => ({
            ...prev,
            ...settingsRes.data
          }));
        }
        
        // Fetch API keys
        const apiKeysRes = await axios.get('/api/settings/api-keys');
        setApiKeys(apiKeysRes.data || []);
        
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle general settings change
  const handleGeneralSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Save general settings
  const saveGeneralSettings = async () => {
    try {
      setSavingGeneral(true);
      
      const res = await axios.post('/api/settings', generalSettings);
      
      setGeneralAlert({
        show: true,
        type: 'success',
        message: 'Settings saved successfully!'
      });
    } catch (err) {
      setGeneralAlert({
        show: true,
        type: 'danger',
        message: 'Failed to save settings. Please try again.'
      });
    } finally {
      setSavingGeneral(false);
    }
  };

  // Generate new API key
  const generateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      setApiKeyAlert({
        show: true,
        type: 'danger',
        message: 'API key name is required'
      });
      return;
    }
    
    try {
      setGeneratingApiKey(true);
      
      const res = await axios.post('/api/settings/api-keys', {
        name: newApiKeyName.trim()
      });
      
      // Show the new API key
      setNewApiKey(res.data);
      setShowNewApiKey(true);
      
      // Add to list
      setApiKeys(prev => [...prev, res.data]);
      
      // Reset form
      setNewApiKeyName('');
      
    } catch (err) {
      setApiKeyAlert({
        show: true,
        type: 'danger',
        message: 'Failed to generate API key. Please try again.'
      });
    } finally {
      setGeneratingApiKey(false);
    }
  };

  // Delete API key
  const deleteApiKey = async (keyId) => {
    try {
      setDeletingApiKey(keyId);
      
      await axios.delete(`/api/settings/api-keys/${keyId}`);
      
      // Remove from list
      setApiKeys(prev => prev.filter(key => key._id !== keyId));
      
      setApiKeyAlert({
        show: true,
        type: 'success',
        message: 'API key deleted successfully'
      });
    } catch (err) {
      setApiKeyAlert({
        show: true,
        type: 'danger',
        message: 'Failed to delete API key. Please try again.'
      });
    } finally {
      setDeletingApiKey(null);
    }
  };

  // Copy API key to clipboard
  const copyApiKey = (key) => {
    navigator.clipboard.writeText(key)
      .then(() => {
        setApiKeyAlert({
          show: true,
          type: 'success',
          message: 'API key copied to clipboard!'
        });
      })
      .catch(() => {
        setApiKeyAlert({
          show: true,
          type: 'danger',
          message: 'Failed to copy API key to clipboard'
        });
      });
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="settings">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Settings</h1>
      </div>

      {/* General Settings */}
      <Card
        title="General Settings"
        icon="gear"
        className="mb-4"
      >
        {generalAlert.show && (
          <Alert
            variant={generalAlert.type}
            dismissible
            onClose={() => setGeneralAlert({ show: false })}
            className="mb-4"
          >
            {generalAlert.message}
          </Alert>
        )}

        <form>
          {/* Notification Delay */}
          <div className="mb-3">
            <label htmlFor="defaultNotificationDelay" className="form-label">Default Notification Delay (minutes)</label>
            <input
              type="number"
              className="form-control"
              id="defaultNotificationDelay"
              name="defaultNotificationDelay"
              value={generalSettings.defaultNotificationDelay}
              onChange={handleGeneralSettingsChange}
              min="0"
              max="60"
            />
            <div className="form-text">
              Wait this many minutes before sending a notification when a monitor goes down.
              This helps prevent notifications for brief outages.
            </div>
          </div>
          
          {/* Use HTTPS */}
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="useHttps"
              name="useHttps"
              checked={generalSettings.useHttps}
              onChange={handleGeneralSettingsChange}
            />
            <label className="form-check-label" htmlFor="useHttps">Use HTTPS for Monitoring</label>
            <div className="form-text">
              Enable this to use HTTPS for secure communication during monitoring checks.
            </div>
          </div>
          
          {/* Timezone */}
          <div className="mb-3">
            <label htmlFor="timezone" className="form-label">Timezone</label>
            <select
              className="form-select"
              id="timezone"
              name="timezone"
              value={generalSettings.timezone}
              onChange={handleGeneralSettingsChange}
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <div className="form-text">
              Set your preferred timezone for display of dates and times.
            </div>
          </div>
          
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Button
              variant="primary"
              onClick={saveGeneralSettings}
              isLoading={savingGeneral}
            >
              Save Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* API Keys */}
      <Card
        title="API Keys"
        icon="key"
        className="mb-4"
      >
        {apiKeyAlert.show && (
          <Alert
            variant={apiKeyAlert.type}
            dismissible
            onClose={() => setApiKeyAlert({ show: false })}
            className="mb-4"
          >
            {apiKeyAlert.message}
          </Alert>
        )}

        <div className="mb-4">
          <p>
            API keys allow you to authenticate API requests to the Monitoring System API.
            You can use these keys to integrate with other systems or custom applications.
          </p>
          
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <label htmlFor="newApiKeyName" className="form-label">API Key Name</label>
              <input
                type="text"
                className="form-control"
                id="newApiKeyName"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
                placeholder="e.g., Production Integration"
              />
            </div>
            <div className="col-md-4">
              <Button
                variant="primary"
                onClick={generateApiKey}
                isLoading={generatingApiKey}
                className="w-100"
              >
                Generate API Key
              </Button>
            </div>
          </div>
        </div>

        {/* API Keys List */}
        {apiKeys.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(key => (
                  <tr key={key._id}>
                    <td>{key.name}</td>
                    <td>{formatDate(key.createdAt)}</td>
                    <td>{key.lastUsed ? formatDate(key.lastUsed) : 'Never used'}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        icon="trash"
                        onClick={() => deleteApiKey(key._id)}
                        isLoading={deletingApiKey === key._id}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted mb-0">No API keys yet. Generate your first API key above.</p>
          </div>
        )}
      </Card>

      {/* New API Key Modal */}
      <Modal
        show={showNewApiKey}
        onClose={() => setShowNewApiKey(false)}
        title="API Key Generated"
        footer={
          <Button
            variant="primary"
            onClick={() => setShowNewApiKey(false)}
          >
            Close
          </Button>
        }
      >
        <div className="alert alert-warning">
          <strong>Important:</strong> This API key will only be shown once. Make sure to copy it now.
        </div>
        
        <div className="mb-3">
          <label htmlFor="apiKey" className="form-label">API Key</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control font-monospace"
              id="apiKey"
              value={newApiKey?.key || ''}
              readOnly
            />
            <Button
              variant="outline-secondary"
              icon="clipboard"
              onClick={() => copyApiKey(newApiKey?.key)}
            >
              Copy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;