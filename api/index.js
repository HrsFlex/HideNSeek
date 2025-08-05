// Vercel serverless function wrapper for our Express app
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = createServer(app);

// Configure Socket.io for Vercel
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['polling'], // Vercel doesn't support WebSocket upgrading
  allowEIO3: true
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// In-memory storage (Note: This will reset on each serverless function restart)
// For production, consider using Redis or a database
const rooms = new Map();
const userSessions = new Map();

// Room management functions
function createRoom(roomCode, settings = {}) {
  const room = {
    code: roomCode,
    users: new Map(),
    messages: [],
    createdAt: new Date(),
    settings: {
      historyDuration: settings.historyDuration || 24,
      maxUsers: settings.maxUsers || 50,
      allowAnonymous: settings.allowAnonymous !== false
    }
  };
  rooms.set(roomCode, room);
  return room;
}

function cleanupExpiredMessages() {
  rooms.forEach((room, roomCode) => {
    const cutoffTime = new Date(Date.now() - (room.settings.historyDuration * 60 * 60 * 1000));
    room.messages = room.messages.filter(msg => new Date(msg.timestamp) > cutoffTime);
    
    if (room.users.size === 0 && new Date(Date.now() - 60 * 60 * 1000) > room.createdAt) {
      rooms.delete(roomCode);
    }
  });
}

// Clean up every 5 minutes (serverless functions have shorter lifespans)
setInterval(cleanupExpiredMessages, 5 * 60 * 1000);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (data) => {
    const { roomCode, username, settings = {} } = data;
    
    if (!roomCode || roomCode.length < 3) {
      socket.emit('error', 'Room code must be at least 3 characters');
      return;
    }

    if (!rooms.has(roomCode)) {
      createRoom(roomCode, settings);
    }

    const room = rooms.get(roomCode);
    
    if (room.users.size >= room.settings.maxUsers) {
      socket.emit('error', 'Room is full');
      return;
    }

    const finalUsername = username || `Anonymous_${Math.floor(Math.random() * 1000)}`;
    
    socket.join(roomCode);
    
    const userData = {
      id: socket.id,
      username: finalUsername,
      joinedAt: new Date(),
      isActive: true
    };
    
    room.users.set(socket.id, userData);
    userSessions.set(socket.id, { roomCode, username: finalUsername });

    socket.emit('room-joined', {
      roomCode,
      username: finalUsername,
      users: Array.from(room.users.values()),
      messages: room.messages,
      settings: room.settings
    });

    socket.to(roomCode).emit('user-joined', userData);
    io.to(roomCode).emit('users-updated', Array.from(room.users.values()));
  });

  socket.on('send-message', (data) => {
    const userSession = userSessions.get(socket.id);
    if (!userSession) return;

    const { roomCode } = userSession;
    const room = rooms.get(roomCode);
    if (!room) return;

    const message = {
      id: uuidv4(),
      username: userSession.username,
      text: data.text,
      timestamp: new Date(),
      userId: socket.id
    };

    room.messages.push(message);
    io.to(roomCode).emit('new-message', message);
  });

  socket.on('typing', (isTyping) => {
    const userSession = userSessions.get(socket.id);
    if (!userSession) return;

    socket.to(userSession.roomCode).emit('user-typing', {
      userId: socket.id,
      username: userSession.username,
      isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const userSession = userSessions.get(socket.id);
    if (userSession) {
      const { roomCode } = userSession;
      const room = rooms.get(roomCode);
      
      if (room) {
        room.users.delete(socket.id);
        socket.to(roomCode).emit('user-left', {
          userId: socket.id,
          username: userSession.username
        });
        io.to(roomCode).emit('users-updated', Array.from(room.users.values()));
      }
      
      userSessions.delete(socket.id);
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'vercel',
    rooms: rooms.size,
    users: userSessions.size
  });
});

// API Routes
app.get('/api/room-info/:roomCode', (req, res) => {
  const { roomCode } = req.params;
  const room = rooms.get(roomCode);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    code: room.code,
    userCount: room.users.size,
    maxUsers: room.settings.maxUsers,
    createdAt: room.createdAt,
    settings: room.settings
  });
});

// Export for Vercel
module.exports = (req, res) => {
  server.emit('request', req, res);
};