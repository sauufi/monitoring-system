// frontend/src/components/dashboard/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMonitors: 0,
    upMonitors: 0,
    downMonitors: 0,
    pendingMonitors: 0,
    uptimePercentage: 0,
    recentIncidents: [],
    monitorTypes: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch monitors
        const monitorsRes = await axios.get('/api/monitoring/monitors');

        // Calculate stats
        const totalMonitors = monitorsRes.data.length;
        const upMonitors = monitorsRes.data.filter(m => m.status === 'up').length;
        const downMonitors = monitorsRes.data.filter(m => m.status === 'down').length;
        const pendingMonitors = monitorsRes.data.filter(m => m.status === 'pending').length;
        
        // Calculate uptime percentage
        const uptimePercentage = totalMonitors > 0 
          ? ((upMonitors / totalMonitors) * 100).toFixed(2) 
          : 0;

        // Count monitor types
        const monitorTypeCounts = monitorsRes.data.reduce((acc, monitor) => {
          acc[monitor.type] = (acc[monitor.type] || 0) + 1;
          return acc;
        }, {});
        
        const monitorTypes = Object.entries(monitorTypeCounts).map(([name, value]) => ({
          name,
          value
        }));

        // Fetch recent incidents from status pages
        const statusPagesRes = await axios.get('/api/status-pages');
        
        let recentIncidents = [];
        for (const page of statusPagesRes.data) {
          const incidentsRes = await axios.get(`/api/status-pages/${page._id}/incidents`);
          recentIncidents = [...recentIncidents, ...incidentsRes.data];
        }
        
        // Sort by creation date and take most recent 5
        recentIncidents = recentIncidents
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setStats({
          totalMonitors,
          upMonitors,
          downMonitors,
          pendingMonitors,
          uptimePercentage,
          recentIncidents,
          monitorTypes
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

  // Summary data for bar chart
  const summaryData = [
    { name: 'Up', value: stats.upMonitors, color: '#4CAF50' },
    { name: 'Down', value: stats.downMonitors, color: '#F44336' },
    { name: 'Pending', value: stats.pendingMonitors, color: '#FFC107' }
  ];

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link to="/monitors/add" className="btn btn-sm btn-outline-primary">
            <i className="bi bi-plus"></i> Add Monitor
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Total Monitors</h5>
              <h2 className="display-4">{stats.totalMonitors}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Up Monitors</h5>
              <h2 className="display-4 text-success">{stats.upMonitors}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Down Monitors</h5>
              <h2 className="display-4 text-danger">{stats.downMonitors}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Uptime Percentage</h5>
              <h2 className="display-4 text-info">{stats.uptimePercentage}%</h2>
            </div>
          </div>
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
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header">
              Recent Incidents
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
                      {stats.recentIncidents.map(incident => (
                        <tr key={incident._id}>
                          <td>{incident.title}</td>
                          <td>
                            <span className={`badge ${
                              incident.status === 'investigating' ? 'bg-warning' :
                              incident.status === 'identified' ? 'bg-info' :
                              incident.status === 'monitoring' ? 'bg-primary' :
                              'bg-success'
                            }`}>
                              {incident.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              incident.impact === 'critical' ? 'bg-danger' :
                              incident.impact === 'major' ? 'bg-warning' :
                              'bg-info'
                            }`}>
                              {incident.impact}
                            </span>
                          </td>
                          <td>{new Date(incident.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="mb-0">No recent incidents.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;