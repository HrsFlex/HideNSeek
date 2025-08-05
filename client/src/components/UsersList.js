import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, Users, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';

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
      return user.color.bg;
    }
    // Fallback color system
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
    for (let i = 0; i < user.username.length; i++) {
      hash = user.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusInfo = (user) => {
    const now = new Date();
    const lastSeen = user.lastSeen ? new Date(user.lastSeen) : null;
    const timeDiff = lastSeen ? now - lastSeen : Infinity;
    
    if (user.isTyping) {
      return { 
        status: 'typing', 
        label: 'Typing...', 
        variant: 'default',
        className: 'status-indicator bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      };
    } else if (timeDiff < 30000) { // Less than 30 seconds
      return { 
        status: 'online', 
        label: 'Online', 
        variant: 'default',
        className: 'status-online'
      };
    } else if (timeDiff < 300000) { // Less than 5 minutes
      return { 
        status: 'away', 
        label: 'Away', 
        variant: 'secondary',
        className: 'status-away'
      };
    } else {
      return { 
        status: 'offline', 
        label: 'Offline', 
        variant: 'outline',
        className: 'status-offline'
      };
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    // Current user first
    if (a.username === currentUsername) return -1;
    if (b.username === currentUsername) return 1;
    
    // Online users before offline
    const statusA = getStatusInfo(a).status;
    const statusB = getStatusInfo(b).status;
    const statusOrder = { typing: 0, online: 1, away: 2, offline: 3 };
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }
    
    // Then by join time
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });

  const onlineCount = users.filter(user => getStatusInfo(user).status !== 'offline').length;
  const typingCount = users.filter(user => user.isTyping).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="m-4 mb-2 modern-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Live Users</span>
            </div>
            <Badge variant="secondary" className="text-sm font-bold">
              {users.length}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">
                {onlineCount} online
              </span>
            </div>
            
            {typingCount > 0 && (
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {typingCount} typing
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Users List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          <AnimatePresence>
            {sortedUsers.map((user, index) => {
              const statusInfo = getStatusInfo(user);
              const isCurrentUser = user.username === currentUsername;
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ 
                    delay: index * 0.05, 
                    duration: 0.3,
                    type: 'spring',
                    stiffness: 200
                  }}
                  layout
                >
                  <Card 
                    className={cn(
                      "modern-card hover:bg-accent/50 transition-all duration-200 cursor-pointer group",
                      isCurrentUser && "ring-2 ring-primary/50 bg-primary/5"
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <motion.div
                          className="relative"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Avatar className="w-10 h-10 border-2 border-border">
                            <AvatarFallback className={cn("text-white font-semibold", getAvatarBackground(user))}>
                              {getAvatar(user)}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Status indicator */}
                          <div className="absolute -bottom-0.5 -right-0.5">
                            {statusInfo.status === 'typing' ? (
                              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse border-2 border-background" />
                            ) : statusInfo.status === 'online' ? (
                              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-background" />
                            ) : statusInfo.status === 'away' ? (
                              <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-background" />
                            ) : (
                              <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-background" />
                            )}
                          </div>
                        </motion.div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className={cn(
                                "font-semibold truncate",
                                isCurrentUser ? "text-primary" : "text-foreground"
                              )}
                            >
                              {isCurrentUser ? (
                                <div className="flex items-center gap-1.5">
                                  <span>You</span>
                                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                                </div>
                              ) : (
                                user.username
                              )}
                            </span>
                            
                            {user.isTyping && (
                              <motion.div
                                className="typing-indicator ml-2"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Joined {new Date(user.joinedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            
                            {user.lastSeen && (
                              <>
                                <span>•</span>
                                <span>
                                  {Math.floor((new Date() - new Date(user.lastSeen)) / 1000)}s ago
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge 
                            variant={statusInfo.variant}
                            className={cn(
                              "text-xs font-medium px-2 py-1",
                              statusInfo.className
                            )}
                          >
                            {statusInfo.label}
                          </Badge>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      <Card className="m-4 mt-2 modern-card">
        <CardContent className="p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>Anonymous Chat • Auto-Delete Messages</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersList;