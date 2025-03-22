// frontend/src/pages/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { dashboardAPI, monitorsAPI, statusPagesAPI } from '../api';
import { formatDate, formatPercentage, formatMonitorStatus } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMonitors: 0,
    upMonitors: 0,
    downMonitors: 0,
    pendingMonitors: 0,
    uptimePercentage: 0,
    recentIncidents: [],
    monitorTypes: []
  });
  const [period, setPeriod] = useState('24h'); // 24h, 7d, 30d
  const [uptimeData, setUptimeData] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch main stats
        const statsResponse = await dashboardAPI.getStats();
        
        // Fetch uptime data for the selected period
        const uptimeResponse = await dashboardAPI.getUptimeOverview(period);
        
        setStats(statsResponse.data);
        setUptimeData(uptimeResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

  // Summary data for bar chart
  const summaryData = [
    { name: 'Up', value: stats.upMonitors, color: '#4CAF50' },
    { name: 'Down', value: stats.downMonitors, color: '#F44336' },
    { name: 'Pending', value: stats.pendingMonitors, color: '#FFC107' }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link to="/monitors/add" className="btn btn-sm btn-primary">
            <i className="bi bi-plus-lg me-1"></i> Add Monitor
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-muted">Total Monitors</h5>
              <h2 className="display-4">{stats.totalMonitors}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-muted">Up Monitors</h5>
              <h2 className="display-4 text-success">{stats.upMonitors}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-muted">Down Monitors</h5>
              <h2 className="display-4 text-danger">{stats.downMonitors}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-muted">Uptime Percentage</h5>
              <h2 className="display-4 text-primary">{formatPercentage(stats.uptimePercentage)}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Uptime Overview */}
      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Uptime Overview</h5>
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${period === '24h' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handlePeriodChange('24h')}
            >
              24h
            </button>
            <button
              type="button"
              className={`btn btn-sm ${period === '7d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handlePeriodChange('7d')}
            >
              7d
            </button>
            <button
              type="button"
              className={`btn btn-sm ${period === '30d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handlePeriodChange('30d')}
            >
              30d
            </button>
          </div>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={uptimeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => [`${value}%`, 'Uptime']} />
              <Legend />
              <Line type="monotone" dataKey="uptime" stroke="#4CAF50" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header">
              Monitor Status Summary
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={summaryData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Number of Monitors">
                    {summaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header">
              Monitor Types
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.monitorTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.monitorTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Incidents</h5>
          <Link to="/status-pages" className="btn btn-sm btn-outline-primary">
            View All
          </Link>
        </div>
        <div className="card-body">
          {stats.recentIncidents.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Impact</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentIncidents.map(incident => {
                    const statusInfo = formatMonitorStatus(incident.status);
                    return (
                      <tr key={incident._id}>
                        <td>{incident.title}</td>
                        <td>
                          <span className={`badge bg-${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            incident.impact === 'critical' ? 'bg-danger' :
                            incident.impact === 'major' ? 'bg-warning' :
                            'bg-info'
                          }`}>
                            {incident.impact.charAt(0).toUpperCase() + incident.impact.slice(1)}
                          </span>
                        </td>
                        <td>{formatDate(incident.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-check-circle text-success display-1"></i>
              <p className="lead mt-3">No incidents reported. Everything is running smoothly!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header">
              Quick Actions
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-3">
                  <Link to="/monitors/add" className="text-decoration-none">
                    <div className="d-flex flex-column align-items-center p-3 border rounded h-100">
                      <i className="bi bi-plus-circle text-primary display-4 mb-2"></i>
                      <span>Add Monitor</span>
                    </div>
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/status-pages/add" className="text-decoration-none">
                    <div className="d-flex flex-column align-items-center p-3 border rounded h-100">
                      <i className="bi bi-display text-primary display-4 mb-2"></i>
                      <span>Create Status Page</span>
                    </div>
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/notification-channels/add" className="text-decoration-none">
                    <div className="d-flex flex-column align-items-center p-3 border rounded h-100">
                      <i className="bi bi-bell text-primary display-4 mb-2"></i>
                      <span>Setup Notifications</span>
                    </div>
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/settings" className="text-decoration-none">
                    <div className="d-flex flex-column align-items-center p-3 border rounded h-100">
                      <i className="bi bi-gear text-primary display-4 mb-2"></i>
                      <span>Settings</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;