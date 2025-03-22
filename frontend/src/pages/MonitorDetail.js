// frontend/src/pages/MonitorDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import axios from 'axios';
import { formatDate, formatDuration, formatMonitorType } from '../utils/formatters';
import { Card, Button, LoadingSpinner, Modal, Alert, StatusBadge } from '../components/common';

const MonitorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [monitor, setMonitor] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('24h'); // 24h, 7d, 30d
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [runCheckLoading, setRunCheckLoading] = useState(false);
  const [statusToggleLoading, setStatusToggleLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Fetch monitor details
  useEffect(() => {
    const fetchMonitor = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(`/api/monitoring/monitors/${id}`);
        setMonitor(res.data);
      } catch (err) {
        setError('Failed to load monitor details. Please try again.');
        console.error('Error fetching monitor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonitor();
  }, [id]);

  // Fetch monitor events based on time period
  useEffect(() => {
    const fetchEvents = async () => {
      if (!monitor) return;

      try {
        setEventLoading(true);
        
        const res = await axios.get(`/api/monitoring/monitors/${id}/events`, {
          params: { period: timePeriod }
        });
        
        setEvents(res.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setEventLoading(false);
      }
    };

    fetchEvents();
  }, [id, monitor, timePeriod]);

  // Handle time period change
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
  };

  // Handle run manual check
  const handleRunCheck = async () => {
    try {
      setRunCheckLoading(true);
      
      const res = await axios.post(`/api/monitoring/monitors/${id}/check`);
      
      // Update monitor with new status
      setMonitor(prevMonitor => ({
        ...prevMonitor,
        status: res.data.status,
        lastChecked: res.data.lastChecked
      }));

      // Add new event to events list
      setEvents(prevEvents => [res.data.event, ...prevEvents]);
      
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
    } finally {
      setRunCheckLoading(false);
    }
  };

  // Handle toggle monitor active status
  const handleToggleActive = async () => {
    try {
      setStatusToggleLoading(true);
      
      const endpoint = monitor.active ? 
        `/api/monitoring/monitors/${id}/pause` : 
        `/api/monitoring/monitors/${id}/resume`;
      
      const res = await axios.put(endpoint);
      
      setMonitor(prevMonitor => ({
        ...prevMonitor,
        active: res.data.active
      }));
      
      setAlert({
        show: true,
        type: 'success',
        message: `Monitor ${monitor.active ? 'paused' : 'resumed'} successfully.`
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: `Failed to ${monitor.active ? 'pause' : 'resume'} monitor. Please try again.`
      });
    } finally {
      setStatusToggleLoading(false);
    }
  };

  // Handle delete monitor
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      
      await axios.delete(`/api/monitoring/monitors/${id}`);
      
      // Close modal and redirect to monitors list
      setShowDeleteModal(false);
      navigate('/monitors');
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to delete monitor. Please try again.'
      });
      setShowDeleteModal(false);
      setDeleteLoading(false);
    }
  };

  // Format chart data from events
  const getChartData = () => {
    if (!events.length) return [];
    
    return events.map(event => ({
      time: new Date(event.createdAt).getTime(),
      status: event.status === 'up' ? 1 : 0,
      responseTime: event.responseTime || 0
    })).sort((a, b) => a.time - b.time);
  };

  // Calculate uptime percentage
  const calculateUptime = () => {
    if (!events.length) return 'N/A';
    
    const totalEvents = events.length;
    const upEvents = events.filter(event => event.status === 'up').length;
    
    return ((upEvents / totalEvents) * 100).toFixed(2) + '%';
  };

  // Get monitor target display text
  const getMonitorTarget = () => {
    if (!monitor) return '';
    
    switch(monitor.type) {
      case 'website':
      case 'keyword':
      case 'cron':
        return monitor.url;
      case 'ssl':
      case 'domain':
        return monitor.domain;
      case 'ping':
        return monitor.ip;
      case 'port':
      case 'tcp':
        return `${monitor.ip}:${monitor.port}`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <LoadingSpinner size="lg" text="Loading monitor details..." />
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <Alert
        variant="danger"
        title="Error Loading Monitor"
        dismissible={false}
        className="mt-4"
      >
        {error || 'Monitor not found. It may have been deleted or you may not have permission to view it.'}
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

  const chartData = getChartData();

  return (
    <div className="monitor-detail">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <div className="d-flex align-items-center">
          <h1 className="h2">{monitor.name}</h1>
          <StatusBadge 
            status={monitor.status} 
            className="ms-2" 
            size="lg" 
          />
          {!monitor.active && (
            <span className="badge bg-secondary ms-2">Paused</span>
          )}
        </div>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Button
            variant="outline-primary"
            icon="arrow-repeat"
            isLoading={runCheckLoading}
            onClick={handleRunCheck}
            className="me-2"
          >
            Run Check
          </Button>
          <Button
            variant={monitor.active ? "outline-warning" : "outline-success"}
            icon={monitor.active ? "pause" : "play"}
            isLoading={statusToggleLoading}
            onClick={handleToggleActive}
            className="me-2"
          >
            {monitor.active ? 'Pause' : 'Resume'}
          </Button>
          <Button
            to={`/monitors/${id}/edit`}
            variant="outline-secondary"
            icon="pencil"
            className="me-2"
          >
            Edit
          </Button>
          <Button
            variant="outline-danger"
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

      {/* Monitor Info Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <Card title="Status" icon="activity" className="h-100">
            <div className="d-flex flex-column align-items-center">
              <StatusBadge 
                status={monitor.status} 
                size="lg" 
                withIcon 
                className="mb-2" 
              />
              <div className="text-muted">
                Last checked: {formatDate(monitor.lastChecked)}
              </div>
            </div>
          </Card>
        </div>
        <div className="col-md-3 mb-3">
          <Card title="Type" icon="tag" className="h-100">
            <div className="d-flex flex-column align-items-center">
              <div className="h5 mb-2">
                <i className={`bi bi-${getMonitorTypeIcon(monitor.type)} me-2`}></i>
                {formatMonitorType(monitor.type)}
              </div>
              <div className="text-muted text-center">
                {getMonitorTarget()}
              </div>
            </div>
          </Card>
        </div>
        <div className="col-md-3 mb-3">
          <Card title="Uptime" icon="graph-up" className="h-100">
            <div className="d-flex flex-column align-items-center">
              <div className="h3 mb-2 text-success">
                {calculateUptime()}
              </div>
              <div className="text-muted">
                Based on {events.length} events
              </div>
            </div>
          </Card>
        </div>
        <div className="col-md-3 mb-3">
          <Card title="Settings" icon="gear" className="h-100">
            <div className="d-flex flex-column">
              <div className="mb-2">
                <small className="text-muted">Check Interval:</small>
                <div>{monitor.interval} minutes</div>
              </div>
              <div className="mb-2">
                <small className="text-muted">Timeout:</small>
                <div>{monitor.timeout} seconds</div>
              </div>
              <div>
                <small className="text-muted">Status:</small>
                <div>{monitor.active ? 'Active' : 'Paused'}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Over Time Chart */}
      <Card 
        title="Status Over Time" 
        icon="bar-chart"
        headerAction={
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${timePeriod === '24h' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleTimePeriodChange('24h')}
            >
              24h
            </button>
            <button
              type="button"
              className={`btn ${timePeriod === '7d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleTimePeriodChange('7d')}
            >
              7d
            </button>
            <button
              type="button"
              className={`btn ${timePeriod === '30d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleTimePeriodChange('30d')}
            >
              30d
            </button>
          </div>
        }
        className="mb-4"
      >
        {eventLoading ? (
          <div className="text-center py-5">
            <LoadingSpinner text="Loading chart data..." />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                type="number" 
                domain={['dataMin', 'dataMax']} 
                tickFormatter={timestamp => {
                  const date = new Date(timestamp);
                  return date.toLocaleString();
                }} 
              />
              <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={value => value === 1 ? 'Up' : 'Down'} />
              <Tooltip 
                labelFormatter={timestamp => `Time: ${new Date(timestamp).toLocaleString()}`}
                formatter={(value, name) => [value === 1 ? 'Up' : 'Down', 'Status']}
              />
              <Legend />
              <Area 
                type="stepAfter" 
                dataKey="status" 
                stroke="#4caf50" 
                fill="#4caf50" 
                fillOpacity={0.3} 
                name="Status" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-exclamation-circle text-muted display-1"></i>
            <p className="mt-3">No events found for the selected time period.</p>
          </div>
        )}
      </Card>

      {/* Response Time Chart */}
      <Card 
        title="Response Time" 
        icon="stopwatch"
        className="mb-4"
      >
        {eventLoading ? (
          <div className="text-center py-5">
            <LoadingSpinner text="Loading response time data..." />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                type="number" 
                domain={['dataMin', 'dataMax']} 
                tickFormatter={timestamp => {
                  const date = new Date(timestamp);
                  return date.toLocaleString();
                }} 
              />
              <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                labelFormatter={timestamp => `Time: ${new Date(timestamp).toLocaleString()}`}
                formatter={(value, name) => [`${value} ms`, 'Response Time']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#2196f3" 
                name="Response Time" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-exclamation-circle text-muted display-1"></i>
            <p className="mt-3">No response time data available for the selected period.</p>
          </div>
        )}
      </Card>

      {/* Recent Events */}
      <Card 
        title="Recent Events" 
        icon="activity"
        className="mb-4"
      >
        {eventLoading ? (
          <div className="text-center py-4">
            <LoadingSpinner text="Loading events..." />
          </div>
        ) : events.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Response Time</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 10).map((event, index) => (
                  <tr key={index}>
                    <td>
                      <StatusBadge status={event.status} />
                    </td>
                    <td>{formatDate(event.createdAt)}</td>
                    <td>
                      {event.responseTime ? `${event.responseTime} ms` : 'N/A'}
                    </td>
                    <td>{event.message || (event.status === 'up' ? 'Monitor is up' : 'Monitor is down')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="mb-0">No events found for this monitor.</p>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal.Delete
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        message={`Are you sure you want to delete the monitor "${monitor.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

// Helper function to get monitor type icon
const getMonitorTypeIcon = (type) => {
  switch (type) {
    case 'website':
      return 'globe';
    case 'ssl':
      return 'shield-lock';
    case 'domain':
      return 'hdd-network';
    case 'ping':
      return 'reception-4';
    case 'port':
      return 'ethernet';
    case 'tcp':
      return 'diagram-3';
    case 'cron':
      return 'clock-history';
    case 'keyword':
      return 'search';
    default:
      return 'question-circle';
  }
};

export default MonitorDetail;