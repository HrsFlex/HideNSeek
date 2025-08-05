import React from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, isOwn, currentUsername }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      layout
    >
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {!isOwn && (
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(message.username)} flex-shrink-0`}
            whileHover={{ scale: 1.1 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {getInitials(message.username)}
          </motion.div>
        )}

        {/* Message Bubble */}
        <motion.div
          className={`group relative ${isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'}`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Username (only for received messages) */}
          {!isOwn && (
            <motion.div
              className="text-xs font-medium text-white/80 mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {message.username === currentUsername ? 'You' : message.username}
            </motion.div>
          )}

          {/* Message Text */}
          <motion.div
            className="text-white leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {message.text}
          </motion.div>

          {/* Timestamp */}
          <motion.div
            className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-white/50'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {formatTime(message.timestamp)}
          </motion.div>

          {/* Message tail */}
          <div
            className={`absolute bottom-0 w-3 h-3 transform rotate-45 ${
              isOwn
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 -right-1'
                : 'bg-white/20 -left-1'
            }`}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;