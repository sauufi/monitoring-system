// frontend/src/pages/AddChannel.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Alert } from '../components/common';

const AddChannel = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: 'email',
    name: '',
    active: true,
    config: {
      email: '',
      phoneNumber: '',
      chatId: '',
      botToken: '',
      webhookUrl: ''
    }
  });

  // Destructure form data
  const { type, name, active, config } = formData;

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (config properties)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: inputType === 'checkbox' ? checked : value
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    let errors = [];

    // Validate name
    if (!name.trim()) {
      errors.push('Channel name is required');
    }

    // Validate type-specific fields
    switch (type) {
      case 'email':
        if (!config.email) {
          errors.push('Email address is required');
        } else if (!/\S+@\S+\.\S+/.test(config.email)) {
          errors.push('Please enter a valid email address');
        }
        break;
      case 'telegram':
        if (!config.chatId) {
          errors.push('Chat ID is required');
        }
        if (!config.botToken) {
          errors.push('Bot Token is required');
        }
        break;
      case 'whatsapp':
      case 'sms':
        if (!config.phoneNumber) {
          errors.push('Phone number is required');
        }
        break;
      case 'webhook':
      case 'slack':
        if (!config.webhookUrl) {
          errors.push('Webhook URL is required');
        } else if (!/^https?:\/\/.+/.test(config.webhookUrl)) {
          errors.push('Please enter a valid URL');
        }
        break;
      default:
        break;
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Create cleaned data object based on channel type
      const channelData = {
        type,
        name: name.trim(),
        active,
        config: {}
      };

      // Add only relevant config for the selected channel type
      switch (type) {
        case 'email':
          channelData.config.email = config.email.trim();
          break;
        case 'telegram':
          channelData.config.chatId = config.chatId.trim();
          channelData.config.botToken = config.botToken.trim();
          break;
        case 'whatsapp':
        case 'sms':
          channelData.config.phoneNumber = config.phoneNumber.trim();
          break;
        case 'webhook':
        case 'slack':
          channelData.config.webhookUrl = config.webhookUrl.trim();
          break;
        default:
          break;
      }

      // Submit data
      await axios.post('/api/notifications/channels', channelData);
      
      // Redirect to channels list
      navigate('/notification-channels');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create notification channel. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="add-channel">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Add Notification Channel</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link to="/notification-channels" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> Back to Channels
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
            <h5 className="card-title">Channel Information</h5>
            
            <div className="mb-3">
              <label htmlFor="type" className="form-label">Channel Type *</label>
              <select
                className="form-select"
                id="type"
                name="type"
                value={type}
                onChange={handleChange}
                required
              >
                <option value="email">Email</option>
                <option value="telegram">Telegram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="slack">Slack</option>
                <option value="webhook">Webhook</option>
                <option value="sms">SMS</option>
              </select>
              <div className="form-text">Select the type of notification channel</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Channel Name *</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="e.g., Work Email, Team Slack"
                required
              />
              <div className="form-text">A descriptive name for this notification channel</div>
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
              <div className="form-text">Enable or disable this notification channel</div>
            </div>
          </div>

          {/* Channel-specific Configuration */}
          <div className="mb-4">
            <h5 className="card-title">Configuration</h5>
            
            {/* Email specific fields */}
            {type === 'email' && (
              <div className="mb-3">
                <label htmlFor="config.email" className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  id="config.email"
                  name="config.email"
                  value={config.email}
                  onChange={handleChange}
                  placeholder="your-email@example.com"
                  required
                />
                <div className="form-text">The email address to send notifications to</div>
              </div>
            )}
            
            {/* Telegram specific fields */}
            {type === 'telegram' && (
              <>
                <div className="mb-3">
                  <label htmlFor="config.chatId" className="form-label">Chat ID *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="config.chatId"
                    name="config.chatId"
                    value={config.chatId}
                    onChange={handleChange}
                    placeholder="Your Telegram Chat ID"
                    required
                  />
                  <div className="form-text">
                    Your Telegram chat ID. You can get it by messaging @userinfobot on Telegram.
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="config.botToken" className="form-label">Bot Token *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="config.botToken"
                    name="config.botToken"
                    value={config.botToken}
                    onChange={handleChange}
                    placeholder="Your Bot Token"
                    required
                  />
                  <div className="form-text">
                    Your Telegram bot token. You can create a bot using @BotFather on Telegram.
                  </div>
                </div>
              </>
            )}
            
            {/* WhatsApp/SMS specific fields */}
            {(type === 'whatsapp' || type === 'sms') && (
              <div className="mb-3">
                <label htmlFor="config.phoneNumber" className="form-label">Phone Number *</label>
                <input
                  type="text"
                  className="form-control"
                  id="config.phoneNumber"
                  name="config.phoneNumber"
                  value={config.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  required
                />
                <div className="form-text">
                  Your phone number in international format (e.g., +1234567890)
                </div>
              </div>
            )}
            
            {/* Webhook/Slack specific fields */}
            {(type === 'webhook' || type === 'slack') && (
              <div className="mb-3">
                <label htmlFor="config.webhookUrl" className="form-label">Webhook URL *</label>
                <input
                  type="url"
                  className="form-control"
                  id="config.webhookUrl"
                  name="config.webhookUrl"
                  value={config.webhookUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/webhook"
                  required
                />
                <div className="form-text">
                  {type === 'slack' 
                    ? 'Your Slack Incoming Webhook URL'
                    : 'The webhook URL to send notifications to'
                  }
                </div>
              </div>
            )}
          </div>
          
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Link to="/notification-channels" className="btn btn-outline-secondary me-md-2">Cancel</Link>
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
                'Create Channel'
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddChannel;