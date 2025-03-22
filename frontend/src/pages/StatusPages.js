// frontend/src/pages/StatusPages.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, LoadingSpinner, Alert, EmptyState, Modal } from '../components/common';

const StatusPages = () => {
  const [statusPages, setStatusPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteStatusPage, setDeleteStatusPage] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Fetch status pages
  useEffect(() => {
    const fetchStatusPages = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/status-pages');
        setStatusPages(res.data);
      } catch (err) {
        setError('Failed to load status pages. Please try again.');
        console.error('Error fetching status pages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusPages();
  }, []);

  // Handle toggle public/private status
  const handleTogglePublic = async (id, isCurrentlyPublic) => {
    try {
      const res = await axios.put(`/api/status-pages/${id}`, {
        isPublic: !isCurrentlyPublic
      });
      
      // Update status pages list
      setStatusPages(prevPages => 
        prevPages.map(page => 
          page._id === id ? { ...page, isPublic: res.data.isPublic } : page
        )
      );

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

  // Handle status page deletion
  const handleDelete = async () => {
    if (!deleteStatusPage) return;
    
    try {
      setDeleteLoading(true);
      await axios.delete(`/api/status-pages/${deleteStatusPage._id}`);
      
      // Remove status page from list
      setStatusPages(prevPages => 
        prevPages.filter(page => page._id !== deleteStatusPage._id)
      );

      setAlert({
        show: true,
        type: 'success',
        message: 'Status page deleted successfully.'
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to delete status page. Please try again.'
      });
    } finally {
      setDeleteLoading(false);
      setDeleteStatusPage(null);
    }
  };

  // Copy public URL to clipboard
  const copyToClipboard = (slug) => {
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/public/status/${slug}`;
    
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <LoadingSpinner size="lg" text="Loading status pages..." />
      </div>
    );
  }

  return (
    <div className="status-pages">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Status Pages</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Button
            to="/status-pages/add"
            variant="primary"
            icon="plus-lg"
          >
            Create Status Page
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

      {statusPages.length === 0 ? (
        <EmptyState
          title="No Status Pages"
          message="Create your first status page to share your service status with your users."
          icon="layout-text-window"
          actionText="Create Status Page"
          actionLink="/status-pages/add"
        />
      ) : (
        <div className="row">
          {statusPages.map(page => (
            <div className="col-md-6 col-lg-4 mb-4" key={page._id}>
              <Card
                className="h-100"
                title={
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <i className="bi bi-layout-text-window fs-3 text-primary"></i>
                    </div>
                    <div>
                      <div>{page.name}</div>
                      <div className="small text-muted">{page.slug}</div>
                    </div>
                  </div>
                }
                headerAction={
                  <span className={`badge ${page.isPublic ? 'bg-success' : 'bg-secondary'}`}>
                    {page.isPublic ? 'Public' : 'Private'}
                  </span>
                }
              >
                <div className="mb-3">
                  {page.description ? (
                    <p className="text-muted mb-0">{page.description}</p>
                  ) : (
                    <p className="text-muted fst-italic mb-0">No description</p>
                  )}
                </div>
                
                <div className="mb-3">
                  <div className="text-muted small mb-1">Monitors:</div>
                  <div>
                    <span className="badge bg-primary me-1">{page.monitors?.length || 0}</span>
                    components monitored
                  </div>
                </div>

                {page.isPublic && (
                  <div className="mb-3">
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control"
                        value={`${window.location.origin}/public/status/${page.slug}`}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => copyToClipboard(page.slug)}
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-auto">
                  <div>
                    <Button
                      to={`/status-pages/${page._id}`}
                      variant="outline-primary"
                      size="sm"
                      icon="gear"
                      className="me-2"
                    >
                      Manage
                    </Button>
                    {page.isPublic && (
                      <a
                        href={`/public/status/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        View
                      </a>
                    )}
                  </div>
                  <div>
                    <Button
                      variant={page.isPublic ? "outline-secondary" : "outline-success"}
                      size="sm"
                      icon={page.isPublic ? "eye-slash" : "eye"}
                      onClick={() => handleTogglePublic(page._id, page.isPublic)}
                      className="me-2"
                    >
                      {page.isPublic ? 'Hide' : 'Publish'}
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      icon="trash"
                      onClick={() => setDeleteStatusPage(page)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteStatusPage && (
        <Modal.Delete
          show={!!deleteStatusPage}
          onCancel={() => setDeleteStatusPage(null)}
          onConfirm={handleDelete}
          isLoading={deleteLoading}
          message={`Are you sure you want to delete the status page "${deleteStatusPage.name}"? This action cannot be undone and will remove all associated monitors and incidents.`}
        />
      )}
    </div>
  );
};

export default StatusPages;