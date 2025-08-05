import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, LogOut, Copy, Check, Settings, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import MessageBubble from './MessageBubble';
import UsersList from './UsersList';
import { cn } from '../lib/utils';

const ChatRoom = ({ room, messages, users, userId, onSendMessage, onLeaveRoom }) => {
  const [message, setMessage] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const success = await onSendMessage(message.trim());
    
    if (success) {
      setMessage('');
    }
    
    setIsSending(false);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      toast.success('🔗 Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy room code');
    }
  };

  const onlineCount = users.filter(user => {
    const now = new Date();
    const lastSeen = user.lastSeen ? new Date(user.lastSeen) : null;
    const timeDiff = lastSeen ? now - lastSeen : Infinity;
    return timeDiff < 300000; // Less than 5 minutes
  }).length;

  return (
    <div className="h-screen flex flex-col chat-container">
      {/* Header */}
      <Card className="m-4 mb-0 modern-card border-b rounded-b-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-6 h-6 bg-white/20 rounded-lg" />
              </motion.div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    Room {room.roomCode}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyRoomCode}
                    className="p-1 h-8 w-8"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {users.length} users
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                    {onlineCount} online
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUsers(!showUsers)}
                className={cn(
                  "transition-all duration-200",
                  showUsers && "bg-accent"
                )}
              >
                <Users className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onLeaveRoom}
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              <AnimatePresence>
                {messages.map((msg, index) => {
                  // Find the user object for this message
                  const messageUser = users.find(u => u.id === msg.userId);
                  return (
                    <MessageBubble
                      key={msg.id || index}
                      message={msg}
                      isOwn={msg.userId === userId}
                      currentUsername={room.username}
                      user={messageUser}
                    />
                  );
                })}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <Card className="m-4 mt-0 modern-card border-t rounded-t-none">
            <CardContent className="p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    placeholder="✨ Type your message..."
                    className="pr-16 h-12 text-base"
                    maxLength="500"
                    autoFocus
                  />
                  
                  {/* Character counter */}
                  {message.length > 450 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                      {message.length}/500
                    </div>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={!message.trim() || isSending}
                  size="lg"
                  className="h-12 px-6"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Users Sidebar */}
        <AnimatePresence>
          {showUsers && (
            <motion.div
              className="w-80 border-l border-border bg-background/50 backdrop-blur-sm"
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ 
                duration: 0.3, 
                type: 'spring', 
                stiffness: 300,
                damping: 30
              }}
            >
              <UsersList users={users} currentUsername={room.username} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatRoom;