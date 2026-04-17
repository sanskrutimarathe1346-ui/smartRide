require("dotenv").config();
const express = require('express');

const path = require("path");
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

  console.log("Mongo URI:",process.env.MONGO_URI);

// Import routes
//const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const passRoutes = require('./routes/passRoutes');
const busRoutes = require('./routes/buses');
const routeRoutes = require('./routes/routes');
const feedbackRoutes = require('./routes/feedback');
const authRoutes = require("./routes/authRoutes");

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware

app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Make io accessible to routes
app.set('io', io);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SmartRide PMPML API is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
//app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/passes', passRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/auth", authRoutes);
//app.use("/uploads", express.static("uploads"));
// ✅ SERVE UPLOADED FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//app.use('/api/pass', passRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SmartRide PMPML API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tickets: '/api/tickets',
      passes: '/api/passes',
      buses: '/api/buses',
      routes: '/api/routes',
      feedback: '/api/feedback'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join bus tracking room
  socket.on('track-bus', (busId) => {
    console.log(`Client ${socket.id} tracking bus: ${busId}`);
    socket.join(`bus-${busId}`);
  });

  // Stop tracking bus
  socket.on('stop-tracking', (busId) => {
    console.log(`Client ${socket.id} stopped tracking bus: ${busId}`);
    socket.leave(`bus-${busId}`);
  });

  // Join route tracking room
  socket.on('track-route', (routeId) => {
    console.log(`Client ${socket.id} tracking route: ${routeId}`);
    socket.join(`route-${routeId}`);
  });

  // Driver location update
  socket.on('driver-location-update', (data) => {
    const { busId, location } = data;
    
    // Broadcast to all clients tracking this bus
    io.to(`bus-${busId}`).emit('bus-location-update', {
      busId,
      location,
      timestamp: new Date()
    });
    
    // Also broadcast to route room if bus is on a route
    if (data.routeId) {
      io.to(`route-${data.routeId}`).emit('bus-location-update', {
        busId,
        location,
        timestamp: new Date()
      });
    }
  });

  // Passenger count update
  socket.on('passenger-count-update', (data) => {
    const { busId, count } = data;
    io.to(`bus-${busId}`).emit('passenger-count-updated', {
      busId,
      count,
      timestamp: new Date()
    });
  });

  // Broadcast announcements
  socket.on('broadcast-announcement', (data) => {
    io.emit('announcement', {
      message: data.message,
      type: data.type,
      timestamp: new Date()
    });
  });

  // ETA updates
  socket.on('eta-update', (data) => {
    io.to(`bus-${data.busId}`).emit('eta-changed', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error from ${socket.id}:`, error);
  });
});

// Periodic tasks
const Ticket = require('./models/Ticket');
const Pass = require('./models/Pass');

// Mark expired tickets and passes every hour
setInterval(async () => {
  try {
    await Ticket.markExpiredTickets();
    await Pass.markExpiredPasses();
    console.log('Expired tickets and passes marked');
  } catch (error) {
    console.error('Error marking expired items:', error);
  }
}, 60 * 60 * 1000); // Run every hour

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚌 SmartRide PMPML Server`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`⚡ Socket.io enabled for real-time tracking`);
  console.log('═══════════════════════════════════════════════════════');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = { app, server, io };
