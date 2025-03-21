// notification-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/notification-service')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify with auth service
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}/api/verify`,
      { token }
    );

    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Notification Channel Schema
const ChannelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['email', 'whatsapp', 'telegram'] 
  },
  config: { 
    // Email config
    email: String,
    
    // WhatsApp config
    phoneNumber: String,
    
    // Telegram config
    chatId: String,
    botToken: String
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Channel = mongoose.model('Channel', ChannelSchema);

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  monitorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId },
  type: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  channels: [{
    type: { type: String, enum: ['email', 'whatsapp', 'telegram'] },
    status: { 
      type: String, 
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    sentAt: Date,
    error: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', NotificationSchema);

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Channel CRUD endpoints
app.post('/api/channels', authenticate, async (req, res) => {
  try {
    const channel = new Channel({
      ...req.body,
      userId: req.user.id
    });
    
    await channel.save();
    res.status(201).json(channel);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/channels', authenticate, async (req, res) => {
  try {
    const channels = await Channel.find({ userId: req.user.id });
    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/channels/:id', authenticate, async (req, res) => {
  try {
    const channel = await Channel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    res.json(channel);
  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/channels/:id', authenticate, async (req, res) => {
  try {
    const channel = await Channel.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Notification endpoints
app.post('/api/notifications', async (req, res) => {
  try {
    const { type, monitor, event, userId } = req.body;
    
    // Create notification
    const notification = new Notification({
      userId,
      monitorId: monitor.id,
      eventId: event.id,
      type,
      message: `Monitor "${monitor.name}" is ${event.currentStatus.toUpperCase()}. ${event.message}`
    });
    
    // Get user's active channels
    const channels = await Channel.find({ userId, active: true });
    
    // Set up notifications for each channel
    notification.channels = channels.map(channel => ({
      type: channel.type,
      status: 'pending'
    }));
    
    await notification.save();
    
    // Send notifications asynchronously
    sendNotification(notification, channels)
      .catch(error => console.error('Error sending notification:', error));
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Notification sending functions
async function sendEmailNotification(notification, channel) {
  // Send email using nodemailer
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'monitoring@example.com',
    to: channel.config.email,
    subject: `[${notification.type}] ${notification.message.split('.')[0]}`,
    text: notification.message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${notification.message.includes('UP') ? '#4CAF50' : '#F44336'};">
          ${notification.message.split('.')[0]}
        </h2>
        <p>${notification.message.split('.')[1] || ''}</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <p>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/monitors/${notification.monitorId}" 
             style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            View Monitor
          </a>
        </p>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
}

async function sendWhatsAppNotification(notification, channel) {
  // Using WhatsApp Business API
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v13.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: channel.config.phoneNumber,
        type: "template",
        template: {
          name: "monitor_notification",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: notification.message },
                { type: "text", text: new Date().toLocaleString() }
              ]
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('WhatsApp API error:', error.response?.data || error.message);
    throw error;
  }
}

async function sendTelegramNotification(notification, channel) {
  try {
    const message = `
🔔 *${notification.message.split('.')[0]}*

${notification.message.split('.')[1] || ''}

Time: ${new Date().toLocaleString()}
    `;
    
    const response = await axios.post(
      `https://api.telegram.org/bot${channel.config.botToken}/sendMessage`,
      {
        chat_id: channel.config.chatId,
        text: message,
        parse_mode: 'Markdown'
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Telegram API error:', error.response?.data || error.message);
    throw error;
  }
}

async function sendNotification(notification, channels) {
  // Send to each channel in parallel
  const sendPromises = channels.map(async (channel, index) => {
    try {
      switch (channel.type) {
        case 'email':
          await sendEmailNotification(notification, channel);
          break;
        case 'whatsapp':
          await sendWhatsAppNotification(notification, channel);
          break;
        case 'telegram':
          await sendTelegramNotification(notification, channel);
          break;
      }
      
      // Update channel status to sent
      notification.channels[index].status = 'sent';
      notification.channels[index].sentAt = new Date();
    } catch (error) {
      console.error(`Error sending ${channel.type} notification:`, error);
      
      // Update channel status to failed
      notification.channels[index].status = 'failed';
      notification.channels[index].error = error.message;
    }
  });
  
  await Promise.all(sendPromises);
  
  // Update overall notification status
  const allSent = notification.channels.every(c => c.status === 'sent');
  const allFailed = notification.channels.every(c => c.status === 'failed');
  
  notification.status = allSent ? 'sent' : (allFailed ? 'failed' : 'pending');
  await notification.save();
  
  return notification;
}