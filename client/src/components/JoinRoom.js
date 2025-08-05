import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Clock, Settings, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

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
    toast.success('Room code generated!');
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (isConnecting) {
      return;
    }
    
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        className="floating-card max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-3 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Anonymous Chat
          </h1>
          <p className="text-white/70">
            Connect anonymously with room codes
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-white/80 text-sm font-medium mb-2">
              Room Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code (e.g., 1943)"
                className="input-field pr-12"
                maxLength="10"
              />
              <motion.button
                type="button"
                onClick={generateRoomCode}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-white/80 text-sm font-medium mb-2">
              Username (Optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Leave empty for anonymous"
              className="input-field"
              maxLength="20"
            />
          </motion.div>

          {/* Settings Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              <span>Room Settings</span>
            </button>
          </motion.div>

          {/* Expandable Settings */}
          <motion.div
            initial={false}
            animate={{
              height: showSettings ? 'auto' : 0,
              opacity: showSettings ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <label className="flex items-center space-x-2 text-white/80 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Chat History Duration (hours)</span>
                </label>
                <select
                  value={settings.historyDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, historyDuration: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={72}>3 days</option>
                  <option value={168}>1 week</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-white/80 text-sm mb-2">
                  <Users className="w-4 h-4" />
                  <span>Max Users</span>
                </label>
                <select
                  value={settings.maxUsers}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  <option value={10}>10 users</option>
                  <option value={25}>25 users</option>
                  <option value={50}>50 users</option>
                  <option value={100}>100 users</option>
                </select>
              </div>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={isConnecting}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: isConnecting ? 1 : 1.02 }}
            whileTap={{ scale: isConnecting ? 1 : 0.98 }}
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                <span>Join Room</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Features */}
        <motion.div
          className="mt-8 pt-6 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-primary-400 text-2xl font-bold">∞</div>
              <div className="text-white/60 text-xs">Anonymous</div>
            </div>
            <div className="text-center">
              <div className="text-primary-400 text-2xl font-bold">⚡</div>
              <div className="text-white/60 text-xs">Real-time</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default JoinRoom;