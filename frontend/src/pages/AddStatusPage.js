// frontend/src/pages/AddStatusPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Alert } from '../components/common';

const AddStatusPage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isPublic: true,
    theme: {
      primaryColor: '#4CAF50',
      backgroundColor: '#ffffff',
      logoUrl: ''
    },
    customDomain: ''
  });

  // Destructure form data
  const { name, slug, description, isPublic, theme, customDomain } = formData;

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('theme.')) {
      // Handle theme properties
      const themeProperty = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        theme: {
          ...prev.theme,
          [themeProperty]: value
        }
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear errors when editing fields
    if (name === 'slug') {
      setSlugError('');
    }
  };

  // Generate slug from name
  const generateSlug = () => {
    if (!name) return;
    
    const generatedSlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    setFormData(prev => ({ ...prev, slug: generatedSlug }));
  };

  // Check if slug is available
  const checkSlugAvailability = async () => {
    if (!slug) {
      setSlugError('Slug is required');
      return false;
    }

    try {
      const res = await axios.get(`/api/status-pages/check-slug/${slug}`);
      if (res.data.available) {
        return true;
      } else {
        setSlugError('This slug is already taken. Please choose another one.');
        return false;
      }
    } catch (err) {
      setSlugError('Failed to check slug availability');
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Validate form
      if (!name) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      
      if (!slug) {
        setSlugError('Slug is required');
        setLoading(false);
        return;
      }

      // Check if slug is available (commented out as API endpoint might not exist)
      // const slugAvailable = await checkSlugAvailability();
      // if (!slugAvailable) {
      //   setLoading(false);
      //   return;
      // }

      // Create status page
      const res = await axios.post('/api/status-pages', formData);
      
      // Redirect to status page details
      navigate(`/status-pages/${res.data._id}`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create status page';
      
      // Check for slug error
      if (message.includes('slug')) {
        setSlugError(message);
      } else {
        setError(message);
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="add-status-page">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Create Status Page</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link to="/status-pages" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> Back to Status Pages
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
              <label htmlFor="name" className="form-label">Status Page Name *</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="e.g., Company API Status"
                required
              />
              <div className="form-text">A descriptive name for your status page</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="slug" className="form-label">Slug *</label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${slugError ? 'is-invalid' : ''}`}
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={handleChange}
                  placeholder="company-api-status"
                  pattern="[a-z0-9-]+"
                  required
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={generateSlug}
                  disabled={!name}
                >
                  Generate
                </button>
                {slugError && <div className="invalid-feedback">{slugError}</div>}
              </div>
              <div className="form-text">
                This will be used in your status page URL: {window.location.origin}/public/status/<strong>{slug || 'your-slug'}</strong>
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={description}
                onChange={handleChange}
                placeholder="Describe your status page"
                rows="3"
              ></textarea>
              <div className="form-text">A brief description of what this status page monitors</div>
            </div>
            
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isPublic"
                name="isPublic"
                checked={isPublic}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="isPublic">Public</label>
              <div className="form-text">Make this status page accessible to the public</div>
            </div>
          </div>

          {/* Appearance */}
          <div className="mb-4">
            <h5 className="card-title">Appearance</h5>
            
            <div className="mb-3">
              <label htmlFor="theme.primaryColor" className="form-label">Primary Color</label>
              <div className="input-group">
                <input
                  type="color"
                  className="form-control form-control-color"
                  id="theme.primaryColor"
                  name="theme.primaryColor"
                  value={theme.primaryColor}
                  onChange={handleChange}
                  title="Choose primary color"
                />
                <input
                  type="text"
                  className="form-control"
                  value={theme.primaryColor}
                  onChange={handleChange}
                  name="theme.primaryColor"
                />
              </div>
              <div className="form-text">The main color used for your status page</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="theme.backgroundColor" className="form-label">Background Color</label>
              <div className="input-group">
                <input
                  type="color"
                  className="form-control form-control-color"
                  id="theme.backgroundColor"
                  name="theme.backgroundColor"
                  value={theme.backgroundColor}
                  onChange={handleChange}
                  title="Choose background color"
                />
                <input
                  type="text"
                  className="form-control"
                  value={theme.backgroundColor}
                  onChange={handleChange}
                  name="theme.backgroundColor"
                />
              </div>
              <div className="form-text">The background color of your status page</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="theme.logoUrl" className="form-label">Logo URL</label>
              <input
                type="url"
                className="form-control"
                id="theme.logoUrl"
                name="theme.logoUrl"
                value={theme.logoUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
              />
              <div className="form-text">The URL of your company logo (optional)</div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="mb-4">
            <h5 className="card-title">Advanced Settings</h5>
            
            <div className="mb-3">
              <label htmlFor="customDomain" className="form-label">Custom Domain</label>
              <input
                type="text"
                className="form-control"
                id="customDomain"
                name="customDomain"
                value={customDomain}
                onChange={handleChange}
                placeholder="status.example.com"
              />
              <div className="form-text">
                Set up a custom domain for your status page (requires additional DNS configuration)
              </div>
            </div>
          </div>

          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <Link to="/status-pages" className="btn btn-outline-secondary me-md-2">Cancel</Link>
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
                'Create Status Page'
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddStatusPage;