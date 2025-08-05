import React from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, isOwn, currentUsername, user }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Use server-generated avatar if available, otherwise fallback to initials
  const getAvatar = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    return message.username
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarBackground = () => {
    if (user?.color?.bg) {
      return `bg-gradient-to-br ${user.color.bg}`;
    }
    // Fallback color system
    const colors = [
      'bg-gradient-to-br from-red-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-emerald-500',
      'bg-gradient-to-br from-yellow-500 to-orange-500',
      'bg-gradient-to-br from-purple-500 to-indigo-500',
      'bg-gradient-to-br from-pink-500 to-rose-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
      'bg-gradient-to-br from-teal-500 to-cyan-500',
    ];
    let hash = 0;
    for (let i = 0; i < message.username.length; i++) {
      hash = message.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div
      className={`message-container flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      layout
    >
      {/* Floating particles for visual effect */}
      <div className="floating-elements">
        <div className="floating-particle" style={{ left: '10%', animationDelay: '0s' }} />
        <div className="floating-particle" style={{ left: '80%', animationDelay: '2s' }} />
      </div>

      <div className={`flex items-end space-x-3 max-w-sm lg:max-w-lg ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Enhanced Avatar */}
        {!isOwn && (
          <motion.div
            className="avatar-container flex-shrink-0"
            whileHover={{ scale: 1.15, rotate: 5 }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            <div className={`avatar-inner ${getAvatarBackground()}`}>
              <span className="text-white font-bold text-sm">
                {getAvatar()}
              </span>
            </div>
          </motion.div>
        )}

        {/* Enhanced Message Bubble */}
        <motion.div
          className={`chat-bubble interactive-hover ${isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'} ${
            message.isExpired ? 'opacity-60 shimmer-effect' : ''
          } relative overflow-hidden`}
          whileHover={{ 
            scale: message.isExpired ? 1 : 1.03,
            y: -2
          }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
          animate={message.isExpired ? { 
            scale: [1, 0.98, 1],
            opacity: [1, 0.4, 0.6] 
          } : {}}
        >
          {/* Glow effect overlay */}
          <div className="glow-effect absolute inset-0 -z-10" />

          {/* Username with enhanced styling */}
          {!isOwn && (
            <motion.div
              className="text-xs font-semibold text-white/90 mb-2 flex items-center space-x-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span>{message.username === currentUsername ? 'You' : message.username}</span>
              {user?.status === 'online' && (
                <div className="online-indicator" />
              )}
            </motion.div>
          )}

          {/* Enhanced Message Text */}
          <motion.div
            className="text-white leading-relaxed font-medium"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
          >
            {message.text}
          </motion.div>

          {/* Enhanced Timestamp and Status */}
          <motion.div
            className={`text-xs mt-2 flex items-center justify-between ${isOwn ? 'text-white/80' : 'text-white/60'}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="font-medium">{formatTime(message.timestamp)}</span>
            {message.isExpired ? (
              <motion.span 
                className="text-red-400 text-xs ml-2 flex items-center space-x-1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span>🔥</span>
                <span>Burned</span>
              </motion.span>
            ) : isOwn && message.viewCount !== undefined && message.totalUsers > 1 ? (
              <motion.span 
                className="text-blue-300 text-xs ml-2 flex items-center space-x-1"
                whileHover={{ scale: 1.1 }}
              >
                <span>👁️</span>
                <span>{message.viewCount}/{message.totalUsers}</span>
              </motion.span>
            ) : null}
          </motion.div>

          {/* Enhanced Message tail with glow */}
          <div
            className={`message-tail ${
              isOwn ? 'message-tail-sent' : 'message-tail-received'
            }`}
          />

          {/* Typing dots for expired messages */}
          {message.isExpired && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;