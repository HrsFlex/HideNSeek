import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Clock, Flame } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

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
      return user.color.bg;
    }
    // Fallback color system using CSS variables
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
    ];
    let hash = 0;
    for (let i = 0; i < message.username.length; i++) {
      hash = message.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getOnlineStatus = () => {
    if (!user) return null;
    
    const now = new Date();
    const lastSeen = user.lastSeen ? new Date(user.lastSeen) : null;
    const timeDiff = lastSeen ? now - lastSeen : Infinity;
    
    if (user.isTyping) {
      return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />;
    } else if (timeDiff < 30000) { // Less than 30 seconds
      return <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />;
    } else if (timeDiff < 300000) { // Less than 5 minutes
      return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
    } else {
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <motion.div
      className={cn(
        "flex mb-4 animate-slide-in-up",
        isOwn ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      layout
    >
      <div className={cn(
        "flex items-end gap-2 max-w-xs sm:max-w-md",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar for received messages */}
        {!isOwn && (
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            <Avatar className="w-8 h-8 border-2 border-border">
              <AvatarFallback className={cn("text-white font-semibold text-xs", getAvatarBackground())}>
                {getAvatar()}
              </AvatarFallback>
            </Avatar>
            
            {/* Status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5">
              {getOnlineStatus()}
            </div>
          </motion.div>
        )}

        {/* Message Content */}
        <motion.div
          className={cn(
            "relative group rounded-2xl px-4 py-3 shadow-lg max-w-full break-words",
            isOwn 
              ? "message-sent text-primary-foreground" 
              : "message-received text-card-foreground",
            message.isExpired && "opacity-60 border-destructive/50"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Username for received messages */}
          {!isOwn && (
            <motion.div
              className="flex items-center gap-2 mb-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-xs font-semibold text-muted-foreground">
                {message.username === currentUsername ? 'You' : message.username}
              </span>
              {user?.isTyping && (
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
            </motion.div>
          )}

          {/* Message Text */}
          <motion.div
            className="text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {message.text}
          </motion.div>

          {/* Timestamp and Status */}
          <motion.div
            className="flex items-center justify-between mt-2 text-xs opacity-70"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(message.timestamp)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {message.isExpired ? (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-auto">
                  <Flame className="w-3 h-3 mr-1" />
                  Burned
                </Badge>
              ) : isOwn && message.viewCount !== undefined && message.totalUsers > 1 ? (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                  <Eye className="w-3 h-3 mr-1" />
                  {message.viewCount}/{message.totalUsers}
                </Badge>
              ) : null}
            </div>
          </motion.div>

          {/* Message tail (speech bubble pointer) */}
          <div
            className={cn(
              "absolute bottom-2 w-3 h-3 rotate-45",
              isOwn 
                ? "-right-1.5 bg-primary" 
                : "-left-1.5 bg-muted border-l border-b border-border"
            )}
          />

          {/* Expired message overlay */}
          {message.isExpired && (
            <motion.div
              className="absolute inset-0 bg-destructive/10 backdrop-blur-[1px] rounded-2xl flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="typing-indicator">
                <div className="typing-dot bg-destructive"></div>
                <div className="typing-dot bg-destructive"></div>
                <div className="typing-dot bg-destructive"></div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;