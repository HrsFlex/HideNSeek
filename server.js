const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Data structures to store rooms and users
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
      historyDuration: settings.historyDuration || 24, // hours
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
    
    // Remove empty rooms after 1 hour of inactivity
    if (room.users.size === 0 && new Date(Date.now() - 60 * 60 * 1000) > room.createdAt) {
      rooms.delete(roomCode);
    }
  });
}

// Clean up expired messages every hour
setInterval(cleanupExpiredMessages, 60 * 60 * 1000);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (data) => {
    const { roomCode, username, settings = {} } = data;
    
    if (!roomCode || roomCode.length < 3) {
      socket.emit('error', 'Room code must be at least 3 characters');
      return;
    }

    // Create room if it doesn't exist
    if (!rooms.has(roomCode)) {
      createRoom(roomCode, settings);
    }

    const room = rooms.get(roomCode);
    
    // Check room capacity
    if (room.users.size >= room.settings.maxUsers) {
      socket.emit('error', 'Room is full');
      return;
    }

    // Generate anonymous username if not provided
    const finalUsername = username || `Anonymous_${Math.floor(Math.random() * 1000)}`;
    
    // Join the room
    socket.join(roomCode);
    
    // Store user data
    const userData = {
      id: socket.id,
      username: finalUsername,
      joinedAt: new Date(),
      isActive: true
    };
    
    room.users.set(socket.id, userData);
    userSessions.set(socket.id, { roomCode, username: finalUsername });

    // Send room info to user
    socket.emit('room-joined', {
      roomCode,
      username: finalUsername,
      users: Array.from(room.users.values()),
      messages: room.messages,
      settings: room.settings
    });

    // Notify others in the room
    socket.to(roomCode).emit('user-joined', userData);
    
    // Update user list for all users in room
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
    
    // Broadcast message to all users in the room
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
        
        // Notify others in the room
        socket.to(roomCode).emit('user-left', {
          userId: socket.id,
          username: userSession.username
        });
        
        // Update user list
        io.to(roomCode).emit('users-updated', Array.from(room.users.values()));
      }
      
      userSessions.delete(socket.id);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});