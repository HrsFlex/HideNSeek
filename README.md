# Anonymous Chatroom 🚀

A modern, real-time anonymous chatroom application with room codes. Connect instantly with others using simple 4-digit room codes.

## ✨ Features

- **Anonymous Chat**: No registration required, join instantly
- **Room Codes**: Create or join rooms using simple codes (e.g., 1943)
- **Real-time Messaging**: Instant message delivery with WebSocket
- **Modern UI**: Beautiful, responsive design with animations
- **Chat History Control**: Configurable message retention (1 hour to 1 week)
- **User Management**: See who's online, typing indicators
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Framer Motion (animations)
- Socket.io-client
- Lucide React (icons)
- React Hot Toast (notifications)

**Backend:**
- Node.js
- Express.js
- Socket.io
- UUID for message IDs
- Helmet (security)
- CORS
- Rate limiting

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   npm run install:client
   ```

4. **Start development server**
   ```bash
   npm run dev:full
   ```

   This runs both the backend (port 5000) and frontend (port 3000) concurrently.

### Individual Commands

- **Backend only**: `npm run dev`
- **Frontend only**: `npm run client`
- **Build for production**: `npm run build`

## 🎯 How to Use

1. **Visit the application** at `http://localhost:3000`
2. **Enter a room code** (e.g., 1943) or generate one
3. **Optionally set a username** (leave empty for anonymous)
4. **Configure room settings** (optional):
   - Chat history duration (1 hour to 1 week)
   - Maximum users (10-100)
5. **Start chatting!**

## 🏗️ Project Structure

```
chat-app/
├── server.js                 # Express server & Socket.io setup
├── package.json              # Server dependencies
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utility functions
│   ├── public/              # Static files
│   └── package.json         # Client dependencies
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
```

### Room Settings

- **History Duration**: 1-168 hours (1 hour to 1 week)
- **Max Users**: 10-100 users per room
- **Anonymous Mode**: Always enabled

## 🚀 Deployment

### Using Node.js

1. **Build the client**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```bash
   export NODE_ENV=production
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Using Docker (Optional)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run install:client
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🎨 Customization

### Colors & Themes
- Edit `client/tailwind.config.js` for color schemes
- Modify CSS variables in `client/src/index.css`

### Features
- Message history duration in `server.js`
- UI components in `client/src/components/`
- Socket events in `server.js` and client hooks

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for development and production
- **Helmet**: Security headers
- **Input Sanitization**: Message length limits
- **Room Capacity**: Configurable user limits

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include browser/OS information

---

**Made with ❤️ for anonymous communication**