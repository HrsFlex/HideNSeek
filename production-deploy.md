# Production Deployment Guide

## 🚀 Deployment Options

### Option 1: Local Docker Deployment (Recommended for testing)

1. **Quick Deploy**
   ```bash
   ./deploy.sh
   ```

2. **Manual Docker Commands**
   ```bash
   # Build and start
   docker-compose up -d --build
   
   # View logs
   docker-compose logs -f
   
   # Stop
   docker-compose down
   ```

### Option 2: VPS/Cloud Server Deployment

#### Requirements
- Ubuntu 20.04+ or similar Linux distribution
- 1GB+ RAM
- Docker and Docker Compose installed
- Domain name (optional but recommended)

#### Steps

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy Application**
   ```bash
   # Clone your repository
   git clone <your-repo-url>
   cd chat-app
   
   # Set environment variables
   cp .env.example .env
   # Edit .env with your production settings
   
   # Deploy
   ./deploy.sh
   ```

3. **Setup Domain (Optional)**
   ```bash
   # Update nginx.conf with your domain
   # Uncomment and configure HTTPS section
   # Get SSL certificates (Let's Encrypt recommended)
   ```

### Option 3: Platform as a Service (PaaS)

#### Heroku
1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Deploy:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

#### Railway, Render, or DigitalOcean App Platform
- Connect your GitHub repository
- Set environment variables
- Deploy automatically

### Option 4: Traditional Node.js Hosting

1. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install && npm run build
   ```

2. **Start with PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "chatroom"
   pm2 startup
   pm2 save
   ```

## 🔧 Environment Configuration

### Required Environment Variables
```env
NODE_ENV=production
PORT=5000
```

### Optional Environment Variables
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_HISTORY_DURATION=24
DEFAULT_MAX_USERS=50
```

## 🔒 Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Use HTTPS in production
- [ ] Regular security updates
- [ ] Monitor application logs
- [ ] Set up backup strategy

## 📊 Monitoring

### Health Check
- URL: `http://your-domain/health`
- Returns: Application status, uptime, room count

### Logs
```bash
# Docker logs
docker-compose logs -f

# PM2 logs
pm2 logs chatroom

# System logs
journalctl -u your-service-name
```

## 🚦 Load Testing

Before production, test with:
```bash
# Install Artillery
npm install -g artillery

# Create test script (artillery-test.yml)
# Run load test
artillery run artillery-test.yml
```

## 🔄 Updates & Maintenance

### Update Application
```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

### Backup Strategy
- Regular database backups (if using persistent storage)
- Configuration backups
- Code repository backups

## 📈 Scaling Considerations

For high traffic:
1. Use Redis for session storage
2. Implement horizontal scaling with load balancer
3. Use CDN for static assets
4. Consider WebSocket clustering
5. Monitor resource usage

## 🆘 Troubleshooting

### Common Issues
1. **Port already in use**: Change PORT in .env
2. **Permission denied**: Check file permissions
3. **Build failures**: Clear Docker cache
4. **WebSocket issues**: Check proxy configuration

### Debug Commands
```bash
# Check application status
curl http://localhost:5000/health

# View container logs
docker-compose logs chatroom

# Access container shell
docker-compose exec chatroom sh
```