const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; // 포트를 3000로 변경

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
const authRoutes = require('./src/routes/auth');
const gameRoutes = require('./src/routes/game');
const questRoutes = require('./src/routes/quest');
const platformRoutes = require('./src/routes/platform');
const attendanceRoutes = require('./src/routes/attendance');

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/quest', questRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/attendance', attendanceRoutes);

// Serve Next.js static files
app.use('/_next', express.static(path.join(__dirname, '.next')));

// Serve React app - fallback to index.html
app.get('*', (req, res) => {
  // Check if it's an API route
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Check if it's a static file request
  if (req.path.startsWith('/_next/')) {
    return res.status(404).json({ error: 'Static file not found' });
  }
  
  // Serve the main page - try different paths
  const indexPath = path.join(__dirname, '.next', 'static', 'index.html');
  const serverIndexPath = path.join(__dirname, '.next', 'server', 'app', 'index.html');
  
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (require('fs').existsSync(serverIndexPath)) {
    res.sendFile(serverIndexPath);
  } else {
    res.status(404).json({ error: 'Page not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Express.js API Server is running on port ${PORT}`);
  console.log(`📡 API Endpoints: http://localhost:${PORT}/api`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/health`);
}); 