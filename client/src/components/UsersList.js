import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Circle } from 'lucide-react';

const UsersList = ({ users, currentUsername }) => {
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

  const sortedUsers = [...users].sort((a, b) => {
    // Current user first
    if (a.username === currentUsername) return -1;
    if (b.username === currentUsername) return 1;
    // Then by join time
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">
          Online Users ({users.length})
        </h3>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedUsers.map((user, index) => (
          <motion.div
            key={user.id}
            className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
          >
            {/* Avatar */}
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(user.username)}`}>
              {getInitials(user.username)}
              
              {/* Online Status */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-800" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-white font-medium truncate">
                  {user.username === currentUsername ? 'You' : user.username}
                </p>
                {index === 0 && user.username === currentUsername && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <p className="text-white/50 text-xs">
                Joined {new Date(user.joinedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center">
              <Circle className="w-2 h-2 text-green-500 fill-current" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-center text-white/50 text-xs">
          Anonymous chat room
        </div>
      </div>
    </div>
  );
};

export default UsersList;