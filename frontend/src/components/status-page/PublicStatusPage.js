// frontend/src/components/status-page/PublicStatusPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PublicStatusPage = () => {
  const { slug } = useParams();
  const [statusPage, setStatusPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatusPage = async () => {
      try {
        const res = await axios.get(`/public/status-pages/${slug}`);
        setStatusPage(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching status page:', err);
        setError('Status page not found or is not available');
        setLoading(false);
      }
    };

    fetchStatusPage();
  }, [slug]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status indicator class
  const getStatusClass = (status) => {
    switch (status) {
      case 'up':
        return 'bg-success';
      case 'down':
        return 'bg-danger';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  // Get overall status class and text
  const getOverallStatusInfo = (status) => {
    switch (status) {
      case 'operational':
        return { 
          class: 'bg-success', 
          text: 'All Systems Operational',
          icon: 'bi-check-circle-fill'
        };
      case 'degraded':
        return { 
          class: 'bg-warning', 
          text: 'Degraded Performance',
          icon: 'bi-exclamation-triangle-fill'
        };
      case 'outage':
        return { 
          class: 'bg-danger', 
          text: 'System Outage',
          icon: 'bi-x-circle-fill'
        };
      default:
        return { 
          class: 'bg-secondary', 
          text: 'Status Unknown',
          icon: 'bi-question-circle-fill'
        };
    }
  };

  // Get monitor type label
  const getMonitorTypeLabel = (type) => {
    switch (type) {
      case 'website':
        return 'Website';
      case 'ssl':
        return 'SSL Certificate';
      case 'domain':
        return 'Domain';
      case 'ping':
        return 'Ping';
      case 'port':
        return 'Port';
      case 'tcp':
        return 'TCP';
      case 'cron':
        return 'Cron Job';
      case 'keyword':
        return 'Keyword';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Get incident status class
  const getIncidentStatusClass = (status) => {
    switch (status) {
      case 'investigating':
        return 'bg-warning';
      case 'identified':
        return 'bg-info';
      case 'monitoring':
        return 'bg-primary';
      case 'resolved':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !statusPage) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error || 'Status page not found'}
        </div>
      </div>
    );
  }

  const overallStatus = getOverallStatusInfo(statusPage.overallStatus);

  return (
    <div 
      className="public-status-page min-vh-100" 
      style={{ backgroundColor: statusPage.theme?.backgroundColor || '#f8f9fa' }}
    >
      <div className="container py-4">
        {/* Header */}
        <header className="text-center mb-5">
          {statusPage.logo && (
            <img 
              src={statusPage.logo} 
              alt={statusPage.name} 
              className="mb-3" 
              style={{ maxHeight: '80px' }}
            />
          )}
          <h1 className="display-4 fw-bold" style={{ color: statusPage.theme?.primaryColor || '#212529' }}>
            {statusPage.name}
          </h1>
          {statusPage.description && (
            <p className="lead text-muted">{statusPage.description}</p>
          )}
        </header>

        {/* Current Status */}
        <div className="card shadow-sm mb-5">
          <div className={`card-header ${overallStatus.class} text-white`}>
            <div className="d-flex align-items-center justify-content-center py-2">
              <i className={`bi ${overallStatus.icon} fs-4 me-2`}></i>
              <h2 className="h4 mb-0">{overallStatus.text}</h2>
            </div>
          </div>
          <div className="card-body">
            <p className="card-text text-center">
              Last updated: {formatDate(new Date())}
            </p>
          </div>
        </div>

        {/* Active Incidents */}
        {statusPage.activeIncidents && statusPage.activeIncidents.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-3">Active Incidents</h3>
            {statusPage.activeIncidents.map(incident => (
              <div className="card shadow-sm mb-3" key={incident._id}>
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="h5 mb-0">{incident.title}</h4>
                    <span className={`badge ${getIncidentStatusClass(incident.status)}`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="timeline">
                    {incident.updates.map((update, index) => (
                      <div className="timeline-item" key={index}>
                        <div className="timeline-badge">
                          <i className={`bi ${
                            update.status === 'investigating' ? 'bi-search' :
                            update.status === 'identified' ? 'bi-info-circle' :
                            update.status === 'monitoring' ? 'bi-eye' :
                            'bi-check-circle'
                          }`}></i>
                        </div>
                        <div className="timeline-content">
                          <h5 className="h6">
                            {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                          </h5>
                          <p>{update.message}</p>
                          <small className="text-muted">{formatDate(update.createdAt)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Monitor Statuses */}
        <div className="mb-5">
          <h3 className="mb-3">Components</h3>
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Last Checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusPage.monitors.map(monitor => (
                      <tr key={monitor.id}>
                        <td className="fw-bold">{monitor.displayName}</td>
                        <td>{getMonitorTypeLabel(monitor.type)}</td>
                        <td>
                          <span className={`badge ${getStatusClass(monitor.status)}`}>
                            {monitor.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{formatDate(monitor.lastChecked)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Resolved Incidents */}
        {statusPage.resolvedIncidents && statusPage.resolvedIncidents.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-3">Recent Resolved Incidents</h3>
            <div className="accordion" id="resolvedIncidents">
              {statusPage.resolvedIncidents.map(incident => (
                <div className="accordion-item" key={incident._id}>
                  <h2 className="accordion-header">
                    <button 
                      className="accordion-button collapsed" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target={`#incident-${incident._id}`}
                    >
                      <div className="d-flex justify-content-between align-items-center w-100 me-3">
                        <span>{incident.title}</span>
                        <small className="text-muted">{formatDate(incident.resolvedAt)}</small>
                      </div>
                    </button>
                  </h2>
                  <div 
                    id={`incident-${incident._id}`} 
                    className="accordion-collapse collapse"
                    data-bs-parent="#resolvedIncidents"
                  >
                    <div className="accordion-body">
                      <div className="timeline">
                        {incident.updates.map((update, index) => (
                          <div className="timeline-item" key={index}>
                            <div className="timeline-badge">
                              <i className={`bi ${
                                update.status === 'investigating' ? 'bi-search' :
                                update.status === 'identified' ? 'bi-info-circle' :
                                update.status === 'monitoring' ? 'bi-eye' :
                                'bi-check-circle'
                              }`}></i>
                            </div>
                            <div className="timeline-content">
                              <h5 className="h6">
                                {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                              </h5>
                              <p>{update.message}</p>
                              <small className="text-muted">{formatDate(update.createdAt)}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pt-4 pb-5 text-muted">
          <div className="mb-2">
            Powered by <strong>Monitoring System</strong>
          </div>
          <div>
            <small>© {new Date().getFullYear()} All rights reserved</small>
          </div>
        </footer>
      </div>

      {/* CSS for timeline */}
      <style jsx="true">{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 25px;
        }
        .timeline-badge {
          position: absolute;
          left: -30px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          text-align: center;
          background-color: #f8f9fa;
          border: 2px solid #dee2e6;
        }
        .timeline-badge i {
          font-size: 12px;
          line-height: 18px;
        }
        .timeline-content {
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }
        .timeline-item:last-child .timeline-content {
          border-bottom: none;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default PublicStatusPage;