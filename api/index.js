const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Rate limiting for API routes - more permissive for chat app
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 200, // 200 requests per minute (much more permissive)
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for certain endpoints
    return req.path === '/api/health' || req.path === '/api/test-json';
  }
});

// Apply rate limiting only to specific endpoints, not all
app.use('/api/join-room', limiter);
app.use('/api/send-message', limiter);

// In-memory storage
const rooms = new Map();
const userSessions = new Map();

// Helper functions for user customization
function generateAvatar(username) {
  const avatars = ['🦄', '🐸', '🦊', '🐝', '🦋', '🐙', '🦑', '🐬', '🦉', '🐺', '🦁', '🐯', '🐨', '🐼', '🦘', '🦒'];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatars[Math.abs(hash) % avatars.length];
}

function generateUserColor(username) {
  const colors = [
    { bg: 'from-pink-500 to-rose-500', text: 'text-white', ring: 'ring-pink-500' },
    { bg: 'from-purple-500 to-indigo-500', text: 'text-white', ring: 'ring-purple-500' },
    { bg: 'from-blue-500 to-cyan-500', text: 'text-white', ring: 'ring-blue-500' },
    { bg: 'from-green-500 to-emerald-500', text: 'text-white', ring: 'ring-green-500' },
    { bg: 'from-yellow-500 to-orange-500', text: 'text-white', ring: 'ring-yellow-500' },
    { bg: 'from-red-500 to-pink-500', text: 'text-white', ring: 'ring-red-500' },
    { bg: 'from-indigo-500 to-purple-500', text: 'text-white', ring: 'ring-indigo-500' },
    { bg: 'from-teal-500 to-cyan-500', text: 'text-white', ring: 'ring-teal-500' }
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

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

// Clean up every 5 minutes
setInterval(cleanupExpiredMessages, 5 * 60 * 1000);

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

// Room info API
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

// Join room endpoint
app.post('/api/join-room', (req, res) => {
  try {
    const { roomCode, username, settings = {}, userId: existingUserId } = req.body;
    
    console.log(`Join room request: ${roomCode}, user: ${username || 'anonymous'}, existing userId: ${existingUserId}`);
    
    if (!roomCode || roomCode.length < 3) {
      return res.status(400).json({ error: 'Room code must be at least 3 characters' });
    }

    // Ensure room exists
    if (!rooms.has(roomCode)) {
      console.log(`Creating new room: ${roomCode}`);
      createRoom(roomCode, settings);
    }

    const room = rooms.get(roomCode);
    
    if (!room) {
      console.error(`Failed to create/get room: ${roomCode}`);
      return res.status(500).json({ error: 'Failed to create room' });
    }
    
    // Use existing userId if provided, otherwise generate new one
    const userId = existingUserId || uuidv4();
    const finalUsername = username || `Anonymous_${Math.floor(Math.random() * 1000)}`;
    
    console.log(`Processing user: ${finalUsername} with ID: ${userId}`);
    
    // Check if user already exists (reconnection case)
    let userData = room.users.get(userId);
    
    if (!userData) {
      // New user joining
      if (room.users.size >= room.settings.maxUsers) {
        console.log(`Room ${roomCode} is full: ${room.users.size}/${room.settings.maxUsers}`);
        return res.status(400).json({ error: 'Room is full' });
      }
      
      userData = {
        id: userId,
        username: finalUsername,
        joinedAt: new Date(),
        lastSeen: new Date(),
        isActive: true,
        status: 'online',
        isTyping: false,
        avatar: generateAvatar(finalUsername),
        color: generateUserColor(finalUsername)
      };
      console.log(`Created new user: ${finalUsername}`);
    } else {
      // Existing user reconnecting
      userData.isActive = true;
      userData.lastSeen = new Date();
      userData.status = 'online';
      userData.username = finalUsername; // Allow username update
      if (!userData.avatar) userData.avatar = generateAvatar(finalUsername);
      if (!userData.color) userData.color = generateUserColor(finalUsername);
      console.log(`User ${finalUsername} reconnecting`);
    }
    
    room.users.set(userId, userData);
    
    console.log(`Room ${roomCode} now has ${room.users.size} users`);

    res.json({
      success: true,
      roomCode,
      username: finalUsername,
      userId,
      users: Array.from(room.users.values()),
      messages: room.messages,
      settings: room.settings
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

app.post('/api/send-message', (req, res) => {
  try {
    const { roomCode, userId, text, username } = req.body;
    
    const room = rooms.get(roomCode);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Try to find user, if not found, use provided username
    let user = room.users.get(userId);
    if (!user && username) {
      // User might have been cleaned up, recreate user session
      user = {
        id: userId,
        username: username,
        joinedAt: new Date(),
        isActive: true
      };
      room.users.set(userId, user);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found in room' });
    }

    const message = {
      id: uuidv4(),
      username: user.username,
      text: text,
      timestamp: new Date(),
      userId: userId,
      viewedBy: new Set([userId]), // Sender has already "viewed" their own message
      isExpired: false
    };

    room.messages.push(message);
    
    // Convert Set to Array for JSON serialization
    const messageForClient = {
      ...message,
      viewedBy: Array.from(message.viewedBy),
      viewCount: message.viewedBy.size,
      totalUsers: room.users.size
    };
    
    res.json({
      success: true,
      message: messageForClient
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark messages as viewed and get room messages
app.post('/api/room-messages/:roomCode', (req, res) => {
  try {
    const { roomCode } = req.params;
    const { userId } = req.body;
    
    let room = rooms.get(roomCode);
    
    // If room doesn't exist, create it with default settings
    if (!room) {
      console.log(`Room ${roomCode} not found, creating new room`);
      room = createRoom(roomCode);
    }
    
    // Update user's last seen timestamp (for online status)
    if (userId && room.users.has(userId)) {
      const user = room.users.get(userId);
      user.lastSeen = new Date();
      user.isActive = true;
      room.users.set(userId, user);
    }
    
    // Clean up inactive users (not seen for more than 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const usersBefore = room.users.size;
    for (const [id, user] of room.users.entries()) {
      if (user.lastSeen && user.lastSeen < thirtySecondsAgo) {
        console.log(`Removing inactive user: ${user.username} (last seen: ${user.lastSeen})`);
        room.users.delete(id);
      }
    }
    if (usersBefore !== room.users.size) {
      console.log(`User count changed from ${usersBefore} to ${room.users.size} in room ${roomCode}`);
    }
    
    // Mark messages as viewed by this user
    if (userId) {
      room.messages.forEach(message => {
        if (!message.isExpired && message.viewedBy) {
          message.viewedBy.add(userId);
        }
      });
      
      // Check if any messages should be deleted (viewed by all active users)
      const activeUserIds = new Set(Array.from(room.users.keys()));
      room.messages = room.messages.filter(message => {
        if (message.isExpired) return false;
        
        // Check if all active users have viewed the message
        const allViewed = message.viewedBy && Array.from(activeUserIds).every(id => message.viewedBy.has(id));
        
        if (allViewed && activeUserIds.size > 1) {
          console.log(`Message ${message.id} viewed by all users, marking as expired`);
          message.isExpired = true;
          // Keep message for a short time to show "expired" status, then remove
          setTimeout(() => {
            const currentRoom = rooms.get(roomCode);
            if (currentRoom) {
              currentRoom.messages = currentRoom.messages.filter(msg => msg.id !== message.id);
            }
          }, 2000); // Remove after 2 seconds
          return true; // Keep temporarily to show expired state
        }
        
        return true;
      });
    }
    
    // Convert Set to Array for JSON serialization and handle missing properties
    const messagesForClient = room.messages.map(msg => ({
      ...msg,
      viewedBy: msg.viewedBy ? Array.from(msg.viewedBy) : [],
      viewCount: msg.viewedBy ? msg.viewedBy.size : 0,
      totalUsers: room.users.size,
      isExpired: msg.isExpired || false
    }));
    
    res.json({
      messages: messagesForClient,
      users: Array.from(room.users.values())
    });
  } catch (error) {
    console.error('Room messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Legacy GET endpoint for backward compatibility
app.get('/api/room-messages/:roomCode', (req, res) => {
  try {
    const { roomCode } = req.params;
    let room = rooms.get(roomCode);
    
    if (!room) {
      console.log(`Room ${roomCode} not found, creating new room`);
      room = createRoom(roomCode);
    }
    
    // Clean up inactive users (not seen for more than 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const usersBefore = room.users.size;
    for (const [id, user] of room.users.entries()) {
      if (user.lastSeen && user.lastSeen < thirtySecondsAgo) {
        console.log(`Removing inactive user: ${user.username} (last seen: ${user.lastSeen})`);
        room.users.delete(id);
      }
    }
    if (usersBefore !== room.users.size) {
      console.log(`User count changed from ${usersBefore} to ${room.users.size} in room ${roomCode}`);
    }
    
    const messagesForClient = room.messages.map(msg => ({
      ...msg,
      viewedBy: msg.viewedBy ? Array.from(msg.viewedBy) : [],
      viewCount: msg.viewedBy ? msg.viewedBy.size : 0,
      totalUsers: room.users.size,
      isExpired: msg.isExpired || false
    }));
    
    res.json({
      messages: messagesForClient,
      users: Array.from(room.users.values())
    });
  } catch (error) {
    console.error('Room messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User activity endpoint to keep user online
app.post('/api/user-activity/:roomCode', (req, res) => {
  try {
    const { roomCode } = req.params;
    const { userId } = req.body;
    
    const room = rooms.get(roomCode);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    if (userId && room.users.has(userId)) {
      const user = room.users.get(userId);
      user.lastSeen = new Date();
      user.isActive = true;
      user.status = 'online';
      room.users.set(userId, user);
      
      res.json({ 
        success: true, 
        onlineUsers: room.users.size,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({ error: 'User not found in room' });
    }
  } catch (error) {
    console.error('User activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Typing status endpoint
app.post('/api/typing-status/:roomCode', (req, res) => {
  try {
    const { roomCode } = req.params;
    const { userId, isTyping } = req.body;
    
    const room = rooms.get(roomCode);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    if (userId && room.users.has(userId)) {
      const user = room.users.get(userId);
      user.isTyping = isTyping;
      user.lastSeen = new Date();
      room.users.set(userId, user);
      
      res.json({ 
        success: true,
        message: `Typing status updated to ${isTyping}`
      });
    } else {
      res.status(404).json({ error: 'User not found in room' });
    }
  } catch (error) {
    console.error('Typing status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint to see all rooms and users
app.get('/api/debug', (req, res) => {
  const roomsData = Array.from(rooms.entries()).map(([code, room]) => ({
    code,
    userCount: room.users.size,
    messageCount: room.messages.length,
    users: Array.from(room.users.values()),
    createdAt: room.createdAt,
    settings: room.settings
  }));
  
  res.json({
    totalRooms: rooms.size,
    rooms: roomsData,
    timestamp: new Date().toISOString(),
    serverInfo: {
      platform: 'vercel',
      nodeVersion: process.version,
      uptime: process.uptime()
    }
  });
});

// Test endpoint to create a room manually
app.post('/api/test-create-room', (req, res) => {
  try {
    const { roomCode } = req.body;
    
    if (!roomCode) {
      return res.status(400).json({ error: 'Room code required' });
    }
    
    const room = createRoom(roomCode, { historyDuration: 24, maxUsers: 50 });
    
    res.json({
      success: true,
      message: `Room ${roomCode} created successfully`,
      room: {
        code: room.code,
        userCount: room.users.size,
        messageCount: room.messages.length,
        settings: room.settings
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple test endpoint for JSON validation
app.get('/api/test-json', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'JSON response working correctly'
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Anonymous Chatroom API', 
    version: '1.0.3',
    endpoints: [
      'GET /api/health',
      'GET /api/debug',
      'GET /api/room-info/:roomCode',
      'POST /api/join-room',
      'POST /api/send-message',
      'GET /api/room-messages/:roomCode',
      'POST /api/room-messages/:roomCode',
      'POST /api/user-activity/:roomCode',
      'POST /api/test-create-room',
      'GET /api/test-json'
    ]
  });
});

module.exports = app;