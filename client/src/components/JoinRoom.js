import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Users, Clock, Settings, Sparkles, ChevronDown, Lock, Zap, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

const JoinRoom = ({ onJoinRoom, isConnected, isConnecting }) => {
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    historyDuration: 24,
    maxUsers: 50,
    allowAnonymous: true
  });

  const generateRoomCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    toast.success('🎲 Room code generated!');
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (isConnecting) return;
    
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    if (roomCode.length < 3) {
      toast.error('Room code must be at least 3 characters');
      return;
    }

    await onJoinRoom(roomCode.trim(), username.trim(), settings);
  };

  const features = [
    { icon: Eye, title: "Anonymous", desc: "Complete privacy", color: "text-blue-400" },
    { icon: Zap, title: "Real-time", desc: "Instant messaging", color: "text-yellow-400" },
    { icon: Lock, title: "Secure", desc: "Auto-delete messages", color: "text-green-400" },
    { icon: Users, title: "Multi-user", desc: "Up to 100 users", color: "text-purple-400" }
  ];

  return (
    <div className="min-h-screen chat-container flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '60s' }} />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="modern-card border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Anonymous Chat
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Connect securely with room codes • Snapchat-style deletion
              </CardDescription>
            </div>

            <div className="flex justify-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Anonymous
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Real-time
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleJoin} className="space-y-4">
              {/* Room Code Input */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="text-sm font-medium text-foreground">
                  Room Code
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Enter room code (e.g., 1943)"
                    className="pr-12 h-12 text-base"
                    maxLength="10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateRoomCode}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-accent"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              {/* Username Input */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="text-sm font-medium text-foreground">
                  Username <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Leave empty for anonymous"
                  className="h-12 text-base"
                  maxLength="20"
                />
              </motion.div>

              {/* Settings Toggle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full justify-between h-auto py-3 px-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Room Settings</span>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    showSettings && "rotate-180"
                  )} />
                </Button>
              </motion.div>

              {/* Expandable Settings */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <Card className="bg-muted/50">
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Chat History Duration
                          </label>
                          <select
                            value={settings.historyDuration}
                            onChange={(e) => setSettings(prev => ({ ...prev, historyDuration: parseInt(e.target.value) }))}
                            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value={1}>1 hour</option>
                            <option value={6}>6 hours</option>
                            <option value={24}>24 hours (default)</option>
                            <option value={72}>3 days</option>
                            <option value={168}>1 week</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Maximum Users
                          </label>
                          <select
                            value={settings.maxUsers}
                            onChange={(e) => setSettings(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value={10}>10 users</option>
                            <option value={25}>25 users</option>
                            <option value={50}>50 users (default)</option>
                            <option value={100}>100 users</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Join Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={isConnecting || !roomCode.trim()}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Joining Room...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>Join Room</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Features Grid */}
            <motion.div
              className="pt-6 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <feature.icon className={cn("w-6 h-6 mx-auto mb-1", feature.color)} />
                    <div className="text-sm font-medium text-foreground">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">{feature.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Footer Note */}
            <motion.div
              className="text-center text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Messages auto-delete when all users have seen them
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinRoom;