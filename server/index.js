const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const bloodRoutes = require('./routes/blood');
const emergencyRoutes = require('./routes/emergency');
const donorRoutes = require('./routes/donor');
const bankRoutes = require('./routes/bank');
const forecastRoutes = require('./routes/forecast');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/forecast', forecastRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Raktam server is running 🩸', timestamp: new Date() });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-city', (city) => {
    socket.join(`city-${city}`);
    console.log(`Socket ${socket.id} joined city: ${city}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/raktam')
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Seed data if empty
    const BloodBank = require('./models/BloodBank');
    const count = await BloodBank.countDocuments();
    if (count === 0) {
      const { seedDatabase } = require('./utils/seed');
      await seedDatabase();
    }
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🩸 Raktam server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
