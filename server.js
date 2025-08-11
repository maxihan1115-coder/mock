const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001; // 포트를 3001로 변경

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Express.js API Server is running on port ${PORT}`);
  console.log(`📡 API Endpoints: http://localhost:${PORT}/api`);
}); 