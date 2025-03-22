// services/status-page-service/utils/validation.js

/**
 * Validate a slug
 * @param {string} slug - Slug to validate
 * @returns {boolean} Is valid slug
 */
 exports.isValidSlug = (slug) => {
    if (!slug) return false;
    return /^[a-z0-9-]+$/.test(slug);
  };
  
  /**
   * Validate a color code
   * @param {string} color - Color code to validate
   * @returns {boolean} Is valid color
   */
  exports.isValidColor = (color) => {
    if (!color) return false;
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };
  
  /**
   * Validate a URL
   * @param {string} url - URL to validate
   * @returns {boolean} Is valid URL
   */
  exports.isValidUrl = (url) => {
    if (!url) return false;
    
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
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
    
    // Simple domain validation regex
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
  };
  
  /**
   * Generate a slug from a string
   * @param {string} text - Text to slugify
   * @returns {string} Slugified text
   */
  exports.slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w-]+/g, '')        // Remove all non-word chars
      .replace(/--+/g, '-')           // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  };
  
  /**
   * Validate status page data
   * @param {Object} data - Status page data
   * @returns {Object} Validation result with isValid and errors
   */
  exports.validateStatusPage = (data) => {
    const errors = [];
    
    // Check name
    if (!data.name || data.name.trim() === '') {
      errors.push('Name is required');
    }
    
    // Check slug if provided
    if (data.slug && !this.isValidSlug(data.slug)) {
      errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
    }
    
    // Check theme colors
    if (data.theme) {
      if (data.theme.primaryColor && !this.isValidColor(data.theme.primaryColor)) {
        errors.push('Primary color must be a valid hex color code (e.g., #FF5733)');
      }
      
      if (data.theme.backgroundColor && !this.isValidColor(data.theme.backgroundColor)) {
        errors.push('Background color must be a valid hex color code (e.g., #FFFFFF)');
      }
      
      if (data.theme.logoUrl && !this.isValidUrl(data.theme.logoUrl)) {
        errors.push('Logo URL must be a valid URL');
      }
    }
    
    // Check custom domain if provided
    if (data.customDomain && !this.isValidDomain(data.customDomain)) {
      errors.push('Custom domain must be a valid domain name');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Validate incident data
   * @param {Object} data - Incident data
   * @returns {Object} Validation result with isValid and errors
   */
  exports.validateIncident = (data) => {
    const errors = [];
    
    // Check title
    if (!data.title || data.title.trim() === '') {
      errors.push('Title is required');
    }
    
    // Check status
    const validStatuses = ['investigating', 'identified', 'monitoring', 'resolved'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Check impact
    const validImpacts = ['minor', 'major', 'critical'];
    if (data.impact && !validImpacts.includes(data.impact)) {
      errors.push(`Impact must be one of: ${validImpacts.join(', ')}`);
    }
    
    // For scheduled incidents
    if (data.scheduled === true) {
      if (!data.scheduledFor || !data.scheduledFor.start || !data.scheduledFor.end) {
        errors.push('Scheduled incidents must have start and end dates');
      } else {
        const start = new Date(data.scheduledFor.start);
        const end = new Date(data.scheduledFor.end);
        
        if (isNaN(start.getTime())) {
          errors.push('Scheduled start date is invalid');
        }
        
        if (isNaN(end.getTime())) {
          errors.push('Scheduled end date is invalid');
        }
        
        if (start >= end) {
          errors.push('Scheduled end date must be after start date');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Validate incident update data
   * @param {Object} data - Update data
   * @returns {Object} Validation result with isValid and errors
   */
  exports.validateIncidentUpdate = (data) => {
    const errors = [];
    
    // Check status
    const validStatuses = ['investigating', 'identified', 'monitoring', 'resolved'];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Check message
    if (!data.message || data.message.trim() === '') {
      errors.push('Message is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };