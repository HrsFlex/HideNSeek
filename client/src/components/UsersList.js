import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, Eye, MessageCircle } from 'lucide-react';

const UsersList = ({ users, currentUsername }) => {
  // Use server-generated avatar if available, otherwise fallback to initials
  const getAvatar = (user) => {
    if (user?.avatar) {
      return user.avatar;
    }
    return user.username
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarBackground = (user) => {
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
    for (let i = 0; i < user.username.length; i++) {
      hash = user.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusIndicator = (user) => {
    const now = new Date();
    const lastSeen = user.lastSeen ? new Date(user.lastSeen) : null;
    const timeDiff = lastSeen ? now - lastSeen : Infinity;
    
    if (user.isTyping) {
      return { status: 'typing', component: <div className="typing-indicator" /> };
    } else if (timeDiff < 30000) { // Less than 30 seconds
      return { status: 'online', component: <div className="status-online" /> };
    } else if (timeDiff < 300000) { // Less than 5 minutes
      return { status: 'away', component: <div className="status-away" /> };
    } else {
      return { status: 'offline', component: <div className="status-offline" /> };
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    // Current user first
    if (a.username === currentUsername) return -1;
    if (b.username === currentUsername) return 1;
    // Online users before offline
    const statusA = getStatusIndicator(a).status;
    const statusB = getStatusIndicator(b).status;
    const statusOrder = { typing: 0, online: 1, away: 2, offline: 3 };
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }
    // Then by join time
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });

  const onlineCount = users.filter(user => getStatusIndicator(user).status !== 'offline').length;
  const typingCount = users.filter(user => user.isTyping).length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Particle system background */}
      <div className="particle-system">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${10 + i * 12}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Enhanced Header */}
      <motion.div 
        className="p-6 border-b border-white/20 hyper-glass-intense"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span>Live Users</span>
            </h3>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-emerald-400 font-medium flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>{onlineCount} online</span>
              </span>
              {typingCount > 0 && (
                <span className="text-sm text-yellow-400 font-medium flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{typingCount} typing</span>
                </span>
              )}
            </div>
          </div>
          <div className="text-2xl font-bold text-white/80">
            {users.length}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Users List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {sortedUsers.map((user, index) => {
            const statusInfo = getStatusIndicator(user);
            return (
              <motion.div
                key={user.id}
                className="user-card group"
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                transition={{ 
                  delay: index * 0.05, 
                  duration: 0.4,
                  type: 'spring',
                  stiffness: 200
                }}
                layout
                whileHover={{ scale: 1.02, y: -2 }}
              >
                {/* Enhanced Avatar */}
                <div className="avatar-container relative">
                  <div className={`avatar-inner ${getAvatarBackground(user)}`}>
                    <span className="text-white font-bold text-lg">
                      {getAvatar(user)}
                    </span>
                  </div>
                  
                  {/* Advanced Status Indicator */}
                  <motion.div 
                    className="absolute -bottom-1 -right-1"
                    whileHover={{ scale: 1.2 }}
                    animate={statusInfo.status === 'typing' ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ repeat: statusInfo.status === 'typing' ? Infinity : 0, duration: 1 }}
                  >
                    {statusInfo.component}
                  </motion.div>
                </div>

                {/* Enhanced User Info */}
                <div className="flex-1 min-w-0 ml-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <motion.p 
                      className="text-white font-bold text-lg truncate"
                      whileHover={{ scale: 1.05 }}
                    >
                      {user.username === currentUsername ? (
                        <span className="flex items-center space-x-2">
                          <span>You</span>
                          <Crown className="w-4 h-4 text-yellow-400" />
                        </span>
                      ) : (
                        user.username
                      )}
                    </motion.p>
                    
                    {user.isTyping && (
                      <motion.div
                        className="typing-dots"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <span></span>
                        <span></span>
                        <span></span>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-white/60 font-medium">
                      Joined {new Date(user.joinedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    
                    {user.lastSeen && (
                      <span className="text-white/40 text-xs">
                        Last seen {Math.floor((new Date() - new Date(user.lastSeen)) / 1000)}s ago
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <motion.div 
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    statusInfo.status === 'typing' ? 'bg-yellow-500/20 text-yellow-300' :
                    statusInfo.status === 'online' ? 'bg-emerald-500/20 text-emerald-300' :
                    statusInfo.status === 'away' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-gray-500/20 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  animate={statusInfo.status === 'typing' ? { 
                    boxShadow: [
                      '0 0 10px rgba(245, 158, 11, 0.3)',
                      '0 0 20px rgba(245, 158, 11, 0.6)',
                      '0 0 10px rgba(245, 158, 11, 0.3)'
                    ]
                  } : {}}
                  transition={{ repeat: statusInfo.status === 'typing' ? Infinity : 0, duration: 1.5 }}
                >
                  {statusInfo.status === 'typing' ? 'Typing...' :
                   statusInfo.status === 'online' ? 'Online' :
                   statusInfo.status === 'away' ? 'Away' : 'Offline'}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Enhanced Footer */}
      <motion.div 
        className="p-4 border-t border-white/20 hyper-glass text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center space-x-2 text-white/70 text-sm">
          <Eye className="w-4 h-4" />
          <span className="font-medium">Anonymous Chat • End-to-End View Deletion</span>
        </div>
      </motion.div>
    </div>
  );
};

export default UsersList;