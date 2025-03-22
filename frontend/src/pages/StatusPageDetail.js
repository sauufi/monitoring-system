// frontend/src/pages/StatusPageDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, LoadingSpinner, Alert, Modal, Badge, EmptyState } from '../components/common';

const StatusPageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [statusPage, setStatusPage] = useState(null);
  const [monitors, setMonitors] = useState([]);
  const [pageMonitors, setPageMonitors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monitorsLoading, setMonitorsLoading] = useState(true);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMonitorModal, setShowAddMonitorModal] = useState(false);
  const [showCreateIncidentModal, setShowCreateIncidentModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Forms state
  const [availableMonitors, setAvailableMonitors] = useState([]);
  const [selectedMonitor, setSelectedMonitor] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Incident form state
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    status: 'investigating',
    impact: 'minor',
    message: ''
  });

  // Fetch status page details
  useEffect(() => {
    const fetchStatusPage = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/status-pages/${id}`);
        setStatusPage(res.data);
      } catch (err) {
        setError('Failed to load status page. It may have been deleted or you may not have permission to access it.');
        console.error('Error fetching status page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusPage();
  }, [id]);

  // Fetch page monitors
  useEffect(() => {
    const fetchPageMonitors = async () => {
      if (!statusPage) return;
      
      try {
        setMonitorsLoading(true);
        const res = await axios.get(`/api/status-pages/${id}/monitors`);
        setPageMonitors(res.data);
      } catch (err) {
        console.error('Error fetching page monitors:', err);
      } finally {
        setMonitorsLoading(false);
      }
    };

    fetchPageMonitors();
  }, [id, statusPage]);

  // Fetch all available monitors
  useEffect(() => {
    const fetchAllMonitors = async () => {
      if (!statusPage) return;
      
      try {
        const res = await axios.get('/api/monitoring/monitors');
        setMonitors(res.data);
        
        // Filter out monitors already on the status page
        const pageMonitorIds = pageMonitors.map(m => m.monitorId);
        setAvailableMonitors(res.data.filter(m => !pageMonitorIds.includes(m._id)));
      } catch (err) {
        console.error('Error fetching monitors:', err);
      }
    };

    fetchAllMonitors();
  }, [statusPage, pageMonitors]);

  // Fetch incidents
  useEffect(() => {
    const fetchIncidents = async () => {
      if (!statusPage) return;
      
      try {
        setIncidentsLoading(true);
        const res = await axios.get(`/api/status-pages/${id}/incidents`);
        setIncidents(res.data);
      } catch (err) {
        console.error('Error fetching incidents:', err);
      } finally {
        setIncidentsLoading(false);
      }
    };

    fetchIncidents();
  }, [id, statusPage]);

  // Handle delete status page
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(`/api/status-pages/${id}`);
      navigate('/status-pages');
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to delete status page. Please try again.'
      });
      setShowDeleteModal(false);
      setDeleteLoading(false);
    }
  };

  // Handle toggle public/private
  const handleTogglePublic = async () => {
    try {
      const res = await axios.put(`/api/status-pages/${id}`, {
        isPublic: !statusPage.isPublic
      });
      
      setStatusPage(prev => ({ ...prev, isPublic: res.data.isPublic }));
      
      setAlert({
        show: true,
        type: 'success',
        message: `Status page is now ${res.data.isPublic ? 'public' : 'private'}.`
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to update status page visibility. Please try again.'
      });
    }
  };

  // Handle add monitor
  const handleAddMonitor = async () => {
    if (!selectedMonitor) return;
    
    try {
      const selectedMonitorObj = monitors.find(m => m._id === selectedMonitor);
      const monitorDisplayName = displayName || selectedMonitorObj.name;
      
      const res = await axios.post(`/api/status-pages/${id}/monitors`, {
        monitorId: selectedMonitor,
        displayName: monitorDisplayName
      });
      
      // Add new monitor to pageMonitors
      setPageMonitors(prev => [...prev, { ...res.data, details: selectedMonitorObj }]);
      
      // Remove from available monitors
      setAvailableMonitors(prev => prev.filter(m => m._id !== selectedMonitor));
      
      // Reset form
      setSelectedMonitor('');
      setDisplayName('');
      
      // Close modal
      setShowAddMonitorModal(false);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Monitor added to status page successfully.'
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: err.response?.data?.message || 'Failed to add monitor to status page. Please try again.'
      });
    }
  };

  // Handle remove monitor
  const handleRemoveMonitor = async (monitorId) => {
    try {
      await axios.delete(`/api/status-pages/${id}/monitors/${monitorId}`);
      
      // Remove monitor from pageMonitors
      const removedMonitor = pageMonitors.find(m => m._id === monitorId);
      setPageMonitors(prev => prev.filter(m => m._id !== monitorId));
      
      // Add back to available monitors if it still exists
      if (removedMonitor && monitors.some(m => m._id === removedMonitor.monitorId)) {
        setAvailableMonitors(prev => [
          ...prev,
          monitors.find(m => m._id === removedMonitor.monitorId)
        ]);
      }
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Monitor removed from status page successfully.'
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to remove monitor from status page. Please try again.'
      });
    }
  };

  // Handle incident form change
  const handleIncidentFormChange = (e) => {
    const { name, value } = e.target;
    setIncidentForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle create incident
  const handleCreateIncident = async () => {
    try {
      const res = await axios.post(`/api/status-pages/${id}/incidents`, incidentForm);
      
      // Add new incident to list
      setIncidents(prev => [res.data, ...prev]);
      
      // Reset form and close modal
      setIncidentForm({
        title: '',
        status: 'investigating',
        impact: 'minor',
        message: ''
      });
      setShowCreateIncidentModal(false);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Incident created successfully.'
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: err.response?.data?.message || 'Failed to create incident. Please try again.'
      });
    }
  };

  // Copy public URL to clipboard
  const copyToClipboard = () => {
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/public/status/${statusPage.slug}`;
    
    navigator.clipboard.writeText(publicUrl)
      .then(() => {
        setAlert({
          show: true,
          type: 'success',
          message: 'Public URL copied to clipboard!'
        });
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
        setAlert({
          show: true,
          type: 'danger',
          message: 'Failed to copy URL to clipboard.'
        });
      });
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (status) => {
    let badgeClass = 'bg-secondary';
    
    if (status === 'up') badgeClass = 'bg-success';
    else if (status === 'down') badgeClass = 'bg-danger';
    else if (status === 'pending') badgeClass = 'bg-warning';
    
    return (
      <Badge
        variant={badgeClass.replace('bg-', '')}
        pill
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  // Get incident status badge
  const getIncidentStatusBadge = (status) => {
    let badgeClass = 'bg-secondary';
    let label = status;
    
    switch (status) {
      case 'investigating':
        badgeClass = 'bg-warning';
        break;
      case 'identified':
        badgeClass = 'bg-info';
        break;
      case 'monitoring':
        badgeClass = 'bg-primary';
        break;
      case 'resolved':
        badgeClass = 'bg-success';
        break;
      default:
        break;
    }
    
    // Capitalize first letter
    label = status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
      <Badge
        variant={badgeClass.replace('bg-', '')}
        pill
      >
        {label}
      </Badge>
    );
  };

  // Get incident impact badge
  const getIncidentImpactBadge = (impact) => {
    let badgeClass = 'bg-secondary';
    
    switch (impact) {
      case 'minor':
        badgeClass = 'bg-info';
        break;
      case 'major':
        badgeClass = 'bg-warning';
        break;
      case 'critical':
        badgeClass = 'bg-danger';
        break;
      default:
        break;
    }
    
    // Capitalize first letter
    const label = impact.charAt(0).toUpperCase() + impact.slice(1);
    
    return (
      <Badge
        variant={badgeClass.replace('bg-', '')}
        pill
      >
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <LoadingSpinner size="lg" text="Loading status page details..." />
      </div>
    );
  }

  if (error || !statusPage) {
    return (
      <Alert
        variant="danger"
        title="Error Loading Status Page"
        dismissible={false}
        className="mt-4"
      >
        {error}
        <div className="mt-3">
          <Button
            to="/status-pages"
            variant="outline-primary"
            icon="arrow-left"
          >
            Back to Status Pages
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="status-page-detail">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <div className="d-flex align-items-center">
          <h1 className="h2">{statusPage.name}</h1>
          <Badge
            variant={statusPage.isPublic ? 'success' : 'secondary'}
            className="ms-2"
          >
            {statusPage.isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>
        <div className="btn-toolbar mb-2 mb-md-0">
          {statusPage.isPublic && (
            <a
              href={`/public/status/${statusPage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary me-2"
            >
              <i className="bi bi-box-arrow-up-right me-1"></i>
              View Public Page
            </a>
          )}
          <Button
            variant={statusPage.isPublic ? "outline-warning" : "outline-success"}
            size="sm"
            icon={statusPage.isPublic ? "eye-slash" : "eye"}
            onClick={handleTogglePublic}
            className="me-2"
          >
            {statusPage.isPublic ? 'Make Private' : 'Make Public'}
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            icon="trash"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
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

      {/* Status Page Information */}
      <div className="row mb-4">
        <div className="col-md-6">
          <Card
            title="Status Page Details"
            icon="info-circle"
            className="h-100"
          >
            <div className="mb-3">
              <div className="text-muted mb-1">Name:</div>
              <div className="fw-bold">{statusPage.name}</div>
            </div>
            
            <div className="mb-3">
              <div className="text-muted mb-1">Slug:</div>
              <div>{statusPage.slug}</div>
            </div>
            
            {statusPage.description && (
              <div className="mb-3">
                <div className="text-muted mb-1">Description:</div>
                <div>{statusPage.description}</div>
              </div>
            )}
            
            {statusPage.isPublic && (
              <div className="mb-3">
                <div className="text-muted mb-1">Public URL:</div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={`${window.location.origin}/public/status/${statusPage.slug}`}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={copyToClipboard}
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
            )}
            
            {statusPage.customDomain && (
              <div className="mb-3">
                <div className="text-muted mb-1">Custom Domain:</div>
                <div>{statusPage.customDomain}</div>
              </div>
            )}
            
            <div className="mb-3">
              <div className="text-muted mb-1">Created:</div>
              <div>{formatDate(statusPage.createdAt)}</div>
            </div>
          </Card>
        </div>
        
        <div className="col-md-6">
          <Card
            title="Appearance"
            icon="palette"
            className="h-100"
          >
            <div className="mb-3">
              <div className="text-muted mb-1">Primary Color:</div>
              <div className="d-flex align-items-center">
                <div 
                  className="color-preview me-2" 
                  style={{ 
                    backgroundColor: statusPage.theme?.primaryColor || '#4CAF50',
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px'
                  }}
                ></div>
                {statusPage.theme?.primaryColor || '#4CAF50'}
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-muted mb-1">Background Color:</div>
              <div className="d-flex align-items-center">
                <div 
                  className="color-preview me-2" 
                  style={{ 
                    backgroundColor: statusPage.theme?.backgroundColor || '#ffffff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6'
                  }}
                ></div>
                {statusPage.theme?.backgroundColor || '#ffffff'}
              </div>
            </div>
            
            {statusPage.theme?.logoUrl && (
              <div className="mb-3">
                <div className="text-muted mb-1">Logo:</div>
                <img 
                  src={statusPage.theme.logoUrl} 
                  alt="Logo" 
                  className="img-thumbnail" 
                  style={{ maxHeight: '100px' }} 
                />
              </div>
            )}
            
            <div className="mt-3">
              <Button
                variant="outline-primary"
                size="sm"
                icon="pencil"
                disabled
              >
                Edit Appearance
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Monitors Section */}
      <Card
        title="Monitors"
        icon="display"
        headerAction={
          <Button
            variant="outline-primary"
            size="sm"
            icon="plus-lg"
            onClick={() => setShowAddMonitorModal(true)}
            disabled={availableMonitors.length === 0}
          >
            Add Monitor
          </Button>
        }
        className="mb-4"
      >
        {monitorsLoading ? (
          <div className="text-center py-4">
            <LoadingSpinner text="Loading monitors..." />
          </div>
        ) : pageMonitors.length === 0 ? (
          <EmptyState
            title="No Monitors"
            message="Add monitors to your status page to start tracking their status."
            icon="display"
            actionText="Add Monitor"
            action={() => setShowAddMonitorModal(true)}
            compact
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Last Checked</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageMonitors.map((monitor) => (
                  <tr key={monitor._id}>
                    <td>
                      <div className="fw-bold">{monitor.displayName}</div>
                      <div className="small text-muted">
                        {monitor.details?.url || monitor.details?.domain || monitor.details?.ip || ''}
                        {monitor.details?.port && `:${monitor.details.port}`}
                      </div>
                    </td>
                    <td>
                      {monitor.details?.type?.charAt(0).toUpperCase() + monitor.details?.type?.slice(1) || 'Unknown'}
                    </td>
                    <td>
                      {monitor.details?.status ? getStatusBadge(monitor.details.status) : 'Unknown'}
                    </td>
                    <td>
                      {monitor.details?.lastChecked ? formatDate(monitor.details.lastChecked) : 'Never'}
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        icon="trash"
                        onClick={() => handleRemoveMonitor(monitor._id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Incidents Section */}
      <Card
        title="Incidents"
        icon="exclamation-triangle"
        headerAction={
          <Button
            variant="outline-primary"
            size="sm"
            icon="plus-lg"
            onClick={() => setShowCreateIncidentModal(true)}
          >
            Create Incident
          </Button>
        }
        className="mb-4"
      >
        {incidentsLoading ? (
          <div className="text-center py-4">
            <LoadingSpinner text="Loading incidents..." />
          </div>
        ) : incidents.length === 0 ? (
          <EmptyState
            title="No Incidents"
            message="No incidents have been reported."
            icon="check-circle"
            compact
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Impact</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident._id}>
                    <td>
                      <div className="fw-bold">{incident.title}</div>
                      <div className="small text-muted">
                        {incident.updates?.[0]?.message?.substring(0, 50)}
                        {incident.updates?.[0]?.message?.length > 50 ? '...' : ''}
                      </div>
                    </td>
                    <td>
                      {getIncidentStatusBadge(incident.status)}
                    </td>
                    <td>
                      {getIncidentImpactBadge(incident.impact)}
                    </td>
                    <td>
                      {formatDate(incident.createdAt)}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        icon="pencil"
                        disabled
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Monitor Modal */}
      <Modal
        show={showAddMonitorModal}
        onClose={() => setShowAddMonitorModal(false)}
        title="Add Monitor to Status Page"
        footer={
          <>
            <Button
              variant="outline-secondary"
              onClick={() => setShowAddMonitorModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddMonitor}
              disabled={!selectedMonitor}
            >
              Add Monitor
            </Button>
          </>
        }
      >
        <form>
          <div className="mb-3">
            <label htmlFor="selectedMonitor" className="form-label">Select Monitor *</label>
            <select
              className="form-select"
              id="selectedMonitor"
              value={selectedMonitor}
              onChange={(e) => {
                setSelectedMonitor(e.target.value);
                // Auto-set display name to monitor name
                if (e.target.value) {
                  const monitor = monitors.find(m => m._id === e.target.value);
                  if (monitor) {
                    setDisplayName(monitor.name);
                  }
                }
              }}
              required
            >
              <option value="">-- Select a monitor --</option>
              {availableMonitors.map(monitor => (
                <option key={monitor._id} value={monitor._id}>
                  {monitor.name} ({monitor.type} - {monitor.status.toUpperCase()})
                </option>
              ))}
            </select>
            <div className="form-text">Select a monitor to add to this status page</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="displayName" className="form-label">Display Name *</label>
            <input
              type="text"
              className="form-control"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How the monitor will be displayed on the status page"
              required
            />
            <div className="form-text">This name will be shown on the public status page</div>
          </div>
        </form>
      </Modal>

      {/* Create Incident Modal */}
      <Modal
        show={showCreateIncidentModal}
        onClose={() => setShowCreateIncidentModal(false)}
        title="Create Incident"
        footer={
          <>
            <Button
              variant="outline-secondary"
              onClick={() => setShowCreateIncidentModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateIncident}
              disabled={!incidentForm.title || !incidentForm.message}
            >
              Create Incident
            </Button>
          </>
        }
      >
        <form>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Incident Title *</label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={incidentForm.title}
              onChange={handleIncidentFormChange}
              placeholder="e.g., API Service Outage"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="status" className="form-label">Status *</label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={incidentForm.status}
              onChange={handleIncidentFormChange}
              required
            >
              <option value="investigating">Investigating</option>
              <option value="identified">Identified</option>
              <option value="monitoring">Monitoring</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="impact" className="form-label">Impact *</label>
            <select
              className="form-select"
              id="impact"
              name="impact"
              value={incidentForm.impact}
              onChange={handleIncidentFormChange}
              required
            >
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="message" className="form-label">Message *</label>
            <textarea
              className="form-control"
              id="message"
              name="message"
              rows="4"
              value={incidentForm.message}
              onChange={handleIncidentFormChange}
              placeholder="Describe what's happening and what you're doing about it"
              required
            ></textarea>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal.Delete
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        message={`Are you sure you want to delete the status page "${statusPage.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default StatusPageDetail;