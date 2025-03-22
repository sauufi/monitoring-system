// frontend/src/pages/Monitors.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, LoadingSpinner, Alert, EmptyState, StatusBadge } from '../components/common';

const Monitors = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Fetch monitors
  useEffect(() => {
    const fetchMonitors = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/monitoring/monitors');
        setMonitors(res.data);
      } catch (err) {
        setError('Failed to load monitors. Please try again.');
        console.error('Error fetching monitors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonitors();
  }, []);

  // Handle status filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortBy !== field) return null;
    
    return (
      <i className={`bi bi-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
    );
  };

  // Get monitor type icon
  const getMonitorTypeIcon = (type) => {
    switch (type) {
      case 'website':
        return 'bi-globe';
      case 'ssl':
        return 'bi-shield-lock';
      case 'domain':
        return 'bi-hdd-network';
      case 'ping':
        return 'bi-reception-4';
      case 'port':
        return 'bi-ethernet';
      case 'tcp':
        return 'bi-diagram-3';
      case 'cron':
        return 'bi-clock-history';
      case 'keyword':
        return 'bi-search';
      default:
        return 'bi-question-circle';
    }
  };

  // Format monitor type
  const formatMonitorType = (type) => {
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

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  // Handle toggle monitor active status
  const handleToggleActive = async (id, isCurrentlyActive) => {
    try {
      const endpoint = isCurrentlyActive 
        ? `/api/monitoring/monitors/${id}/pause` 
        : `/api/monitoring/monitors/${id}/resume`;
      
      const res = await axios.put(endpoint);
      
      // Update monitor in list
      setMonitors(prev => 
        prev.map(monitor => 
          monitor._id === id ? { ...monitor, active: res.data.active } : monitor
        )
      );
      
      setAlert({
        show: true,
        type: 'success',
        message: `Monitor ${isCurrentlyActive ? 'paused' : 'resumed'} successfully.`
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: `Failed to ${isCurrentlyActive ? 'pause' : 'resume'} monitor. Please try again.`
      });
    }
  };

  // Run manual check
  const handleRunCheck = async (id) => {
    try {
      const res = await axios.post(`/api/monitoring/monitors/${id}/check`);
      
      // Update monitor in list
      setMonitors(prev => 
        prev.map(monitor => 
          monitor._id === id ? { 
            ...monitor, 
            status: res.data.status,
            lastChecked: res.data.lastChecked
          } : monitor
        )
      );
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Monitor check completed successfully.'
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to run monitor check. Please try again.'
      });
    }
  };

  // Filter and sort monitors
  const getFilteredAndSortedMonitors = () => {
    // Filter by status and search term
    let filteredMonitors = monitors.filter(monitor => {
      // Apply status filter
      if (filter !== 'all' && monitor.status !== filter) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm && !monitor.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    // Sort monitors
    filteredMonitors.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'type':
          valueA = a.type;
          valueB = b.type;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'lastChecked':
          valueA = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
          valueB = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      
      // Handle sorting order
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return filteredMonitors;
  };

  const filteredMonitors = getFilteredAndSortedMonitors();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <LoadingSpinner size="lg" text="Loading monitors..." />
      </div>
    );
  }

  return (
    <div className="monitors">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Monitors</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Button
            to="/monitors/add"
            variant="primary"
            icon="plus-lg"
          >
            Add Monitor
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

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search monitors..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="btn-group float-md-end" role="group">
            <input
              type="radio"
              className="btn-check"
              name="status-filter"
              id="all"
              value="all"
              checked={filter === 'all'}
              onChange={handleFilterChange}
            />
            <label className="btn btn-outline-secondary" htmlFor="all">All</label>
            
            <input
              type="radio"
              className="btn-check"
              name="status-filter"
              id="up"
              value="up"
              checked={filter === 'up'}
              onChange={handleFilterChange}
            />
            <label className="btn btn-outline-success" htmlFor="up">Up</label>
            
            <input
              type="radio"
              className="btn-check"
              name="status-filter"
              id="down"
              value="down"
              checked={filter === 'down'}
              onChange={handleFilterChange}
            />
            <label className="btn btn-outline-danger" htmlFor="down">Down</label>
            
            <input
              type="radio"
              className="btn-check"
              name="status-filter"
              id="pending"
              value="pending"
              checked={filter === 'pending'}
              onChange={handleFilterChange}
            />
            <label className="btn btn-outline-warning" htmlFor="pending">Pending</label>
          </div>
        </div>
      </div>

      {monitors.length === 0 ? (
        <EmptyState
          title="No Monitors"
          message="You haven't created any monitors yet. Create your first monitor to start tracking uptime and performance."
          icon="display"
          actionText="Add Your First Monitor"
          actionLink="/monitors/add"
        />
      ) : filteredMonitors.length === 0 ? (
        <EmptyState.NoResults
          message="No monitors match your current filters. Try adjusting your search or filters."
          action={() => {
            setFilter('all');
            setSearchTerm('');
          }}
          actionText="Clear Filters"
        />
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th className="cursor-pointer" onClick={() => handleSortChange('name')}>
                  Name {getSortIndicator('name')}
                </th>
                <th className="cursor-pointer" onClick={() => handleSortChange('type')}>
                  Type {getSortIndicator('type')}
                </th>
                <th>Target</th>
                <th className="cursor-pointer" onClick={() => handleSortChange('status')}>
                  Status {getSortIndicator('status')}
                </th>
                <th className="cursor-pointer" onClick={() => handleSortChange('lastChecked')}>
                  Last Checked {getSortIndicator('lastChecked')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMonitors.map(monitor => (
                <tr key={monitor._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className={`bi ${getMonitorTypeIcon(monitor.type)} text-primary me-2`}></i>
                      <Link to={`/monitors/${monitor._id}`} className="text-decoration-none fw-bold text-dark">
                        {monitor.name}
                      </Link>
                      {!monitor.active && (
                        <Badge variant="secondary" pill className="ms-2">Paused</Badge>
                      )}
                    </div>
                  </td>
                  <td>{formatMonitorType(monitor.type)}</td>
                  <td className="text-truncate" style={{ maxWidth: '200px' }}>
                    {monitor.url || monitor.domain || monitor.ip || '-'}
                    {monitor.port && `:${monitor.port}`}
                  </td>
                  <td>
                    <StatusBadge status={monitor.status} withIcon />
                  </td>
                  <td>
                    {monitor.lastChecked ? formatDate(monitor.lastChecked) : 'Never'}
                  </td>
                  <td>
                    <div className="btn-group">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        icon="arrow-repeat"
                        onClick={() => handleRunCheck(monitor._id)}
                        title="Run check now"
                        className="me-1"
                      >
                        Check
                      </Button>
                      <Button
                        variant={monitor.active ? "outline-warning" : "outline-success"}
                        size="sm"
                        icon={monitor.active ? "pause-fill" : "play-fill"}
                        onClick={() => handleToggleActive(monitor._id, monitor.active)}
                        title={monitor.active ? "Pause monitoring" : "Resume monitoring"}
                        className="me-1"
                      >
                        {monitor.active ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        to={`/monitors/${monitor._id}/edit`}
                        variant="outline-secondary"
                        size="sm"
                        icon="pencil"
                        title="Edit monitor"
                      >
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Monitors;