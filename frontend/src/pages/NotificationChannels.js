// frontend/src/pages/NotificationChannels.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, Button, LoadingSpinner, Alert, 
  EmptyState, Modal, Badge 
} from '../components/common';

const NotificationChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteChannel, setDeleteChannel] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Fetch notification channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/notifications/channels');
        setChannels(res.data);
      } catch (err) {
        setError('Failed to load notification channels. Please try again.');
        console.error('Error fetching channels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  // Handle channel status toggle
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const updatedChannel = {
        active: !currentStatus
      };

      const res = await axios.put(`/api/notifications/channels/${id}`, updatedChannel);
      
      // Update channels list
      setChannels(prevChannels => 
        prevChannels.map(channel => 
          channel._id === id ? { ...channel, active: res.data.active } : channel
        )
      );

      setAlert({
        show: true,
        type: 'success',
        message: `Channel ${res.data.active ? 'activated' : 'deactivated'} successfully.`
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: `Failed to update channel status. Please try again.`
      });
    }
  };

  // Handle channel deletion
  const handleDelete = async () => {
    if (!deleteChannel) return;
    
    try {
      setDeleteLoading(true);
      await axios.delete(`/api/notifications/channels/${deleteChannel._id}`);
      
      // Remove channel from list
      setChannels(prevChannels => 
        prevChannels.filter(channel => channel._id !== deleteChannel._id)
      );

      setAlert({
        show: true,
        type: 'success',
        message: 'Notification channel deleted successfully.'
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to delete notification channel. Please try again.'
      });
    } finally {
      setDeleteLoading(false);
      setDeleteChannel(null);
    }
  };

  // Render channel icon based on type
  const renderChannelIcon = (type) => {
    switch (type) {
      case 'email':
        return <i className="bi bi-envelope-fill text-primary fs-3"></i>;
      case 'telegram':
        return <i className="bi bi-telegram text-info fs-3"></i>;
      case 'whatsapp':
        return <i className="bi bi-whatsapp text-success fs-3"></i>;
      case 'slack':
        return <i className="bi bi-slack text-danger fs-3"></i>;
      case 'webhook':
        return <i className="bi bi-code-slash text-secondary fs-3"></i>;
      case 'sms':
        return <i className="bi bi-phone text-info fs-3"></i>;
      default:
        return <i className="bi bi-bell-fill text-secondary fs-3"></i>;
    }
  };

  // Get channel type display name
  const getChannelTypeDisplay = (type) => {
    switch (type) {
      case 'email': return 'Email';
      case 'telegram': return 'Telegram';
      case 'whatsapp': return 'WhatsApp';
      case 'slack': return 'Slack';
      case 'webhook': return 'Webhook';
      case 'sms': return 'SMS';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Get channel details based on type
  const getChannelDetails = (channel) => {
    switch (channel.type) {
      case 'email':
        return channel.config?.email || 'No email configured';
      case 'telegram':
        return 'Chat ID: ' + (channel.config?.chatId || 'Not configured');
      case 'whatsapp':
        return channel.config?.phoneNumber || 'No phone number configured';
      case 'slack':
        return 'Webhook URL configured';
      case 'webhook':
        return 'URL configured';
      case 'sms':
        return channel.config?.phoneNumber || 'No phone number configured';
      default:
        return 'Configuration available';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <LoadingSpinner size="lg" text="Loading notification channels..." />
      </div>
    );
  }

  return (
    <div className="notification-channels">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Notification Channels</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Button
            to="/notification-channels/add"
            variant="primary"
            icon="plus-lg"
          >
            Add Channel
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

      {channels.length === 0 ? (
        <EmptyState
          title="No Notification Channels"
          message="Add your first notification channel to receive alerts when your monitors change status."
          icon="bell"
          actionText="Add Notification Channel"
          actionLink="/notification-channels/add"
        />
      ) : (
        <div className="row">
          {channels.map(channel => (
            <div className="col-md-6 col-lg-4 mb-4" key={channel._id}>
              <Card
                className={`h-100 ${!channel.active ? 'opacity-75' : ''}`}
                headerClassName={`bg-light ${!channel.active ? 'text-muted' : ''}`}
                title={
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      {renderChannelIcon(channel.type)}
                    </div>
                    <div>
                      <div>{channel.name || getChannelTypeDisplay(channel.type)}</div>
                      <div className="small text-muted">
                        {getChannelTypeDisplay(channel.type)}
                      </div>
                    </div>
                  </div>
                }
                headerAction={
                  <Badge
                    variant={channel.active ? 'success' : 'secondary'}
                    pill
                  >
                    {channel.active ? 'Active' : 'Inactive'}
                  </Badge>
                }
              >
                <div className="mb-3">
                  <div className="text-muted small mb-1">Notification Sent To:</div>
                  <div>{getChannelDetails(channel)}</div>
                </div>

                <div className="d-flex justify-content-between mt-auto">
                  <Button
                    variant={channel.active ? 'outline-warning' : 'outline-success'}
                    size="sm"
                    icon={channel.active ? 'pause-fill' : 'play-fill'}
                    onClick={() => handleToggleActive(channel._id, channel.active)}
                  >
                    {channel.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    icon="trash"
                    onClick={() => setDeleteChannel(channel)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteChannel && (
        <Modal.Delete
          show={!!deleteChannel}
          onCancel={() => setDeleteChannel(null)}
          onConfirm={handleDelete}
          isLoading={deleteLoading}
          message={`Are you sure you want to delete the notification channel "${deleteChannel.name || getChannelTypeDisplay(deleteChannel.type)}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default NotificationChannels;