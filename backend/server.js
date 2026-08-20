const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config(); // Load backend/.env if running inside backend/

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const customerRoutes = require('./routes/customerRoutes');
const qrRoutes = require('./routes/qrRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Middleware - CORS configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const dbState = states[mongoose.connection.readyState] || 'Unknown';
  res.json({
    status: 'online',
    dbStatus: dbState,
    timestamp: new Date()
  });
});

// REST API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/qr', qrRoutes);

// Production Static Frontend Hosting Support (Single Web Service Deployment)
const frontendPath = path.join(__dirname, '../frontend');
if (fs.existsSync(frontendPath)) {
  app.use('/public', express.static(path.join(frontendPath, 'public')));
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Production Ready Server running on port ${PORT}`);
  console.log(`🔗 Application Base URL: http://localhost:${PORT}`);
});
