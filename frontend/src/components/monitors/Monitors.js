// frontend/src/components/monitors/Monitors.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Monitors = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMonitors = async () => {
      try {
        const res = await axios.get('/api/monitoring/monitors');
        setMonitors(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching monitors:', err);
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

  // Get status badge class
  const getStatusBadgeClass = (status) => {
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

  // Apply filters
  const filteredMonitors = monitors.filter(monitor => {
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

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="monitors">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Monitors</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link to="/monitors/add" className="btn btn-sm btn-outline-primary">
            <i className="bi bi-plus"></i> Add Monitor
          </Link>
        </div>
      </div>

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
          <div className="btn-group float-end" role="group">
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

      {filteredMonitors.length > 0 ? (
        <div className="row">
          {filteredMonitors.map(monitor => (
            <div className="col-md-6 col-lg-4 mb-4" key={monitor._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <i className={`bi ${getMonitorTypeIcon(monitor.type)} me-2`}></i>
                    <span className="fw-bold">{monitor.name}</span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(monitor.status)}`}>
                    {monitor.status.toUpperCase()}
                  </span>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <small className="text-muted">Type:</small>
                    <div>{monitor.type.charAt(0).toUpperCase() + monitor.type.slice(1)}</div>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">Target:</small>
                    <div className="text-truncate">
                      {monitor.url || monitor.domain || monitor.ip || '-'}
                      {monitor.port && `:${monitor.port}`}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">Last Checked:</small>
                    <div>
                      {monitor.lastChecked ? new Date(monitor.lastChecked).toLocaleString() : 'Never'}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">Interval:</small>
                    <div>{monitor.interval} minute(s)</div>
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <Link to={`/monitors/${monitor._id}`} className="btn btn-sm btn-outline-primary me-2">
                    <i className="bi bi-graph-up"></i> Details
                  </Link>
                  <Link to={`/monitors/${monitor._id}/edit`} className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-pencil"></i> Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-search display-1 text-muted"></i>
          <p className="lead mt-3">No monitors found with the current filters.</p>
          <Link to="/monitors/add" className="btn btn-primary mt-2">
            <i className="bi bi-plus"></i> Add Your First Monitor
          </Link>
        </div>
      )}
    </div>
  );
};

export default Monitors;