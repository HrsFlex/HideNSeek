import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, LogOut, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import MessageBubble from './MessageBubble';
import UsersList from './UsersList';
import TypingIndicator from './TypingIndicator';

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
      toast.success('Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy room code');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Enhanced Header */}
      <motion.header
        className="hyper-glass-intense border-b border-white/20 p-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <motion.div
              className="p-2 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-6 h-6 bg-white rounded-md opacity-80" />
            </motion.div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">
                  Room {room.roomCode}
                </h1>
                <motion.button
                  onClick={copyRoomCode}
                  className="p-1 text-white/60 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
              <p className="text-white/60 text-sm">
                {users.length} user{users.length !== 1 ? 's' : ''} online
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowUsers(!showUsers)}
              className="btn-secondary p-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={onLeaveRoom}
              className="btn-secondary p-3 hover:bg-red-500/20 hover:border-red-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 flex max-w-4xl mx-auto w-full">
        {/* Enhanced Chat Area */}
        <motion.div
          className="flex-1 flex flex-col relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Particle system for chat area */}
          <div className="particle-system">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${5 + i * 8}%`,
                  width: `${3 + Math.random() * 6}px`,
                  height: `${3 + Math.random() * 6}px`,
                  animationDelay: `${i * 1.2}s`,
                  animationDuration: `${8 + Math.random() * 6}s`
                }}
              />
            ))}
          </div>

          {/* Enhanced Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
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

          {/* Enhanced Message Input */}
          <motion.div
            className="p-6 hyper-glass-intense border-t border-white/20 relative overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <div className="glow-effect absolute inset-0 -z-10" />
            
            <form onSubmit={handleSendMessage} className="flex space-x-4 relative z-10">
              <div className="flex-1 relative">
                <motion.input
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder="✨ Share your thoughts anonymously..."
                  className="input-field w-full shimmer-effect"
                  maxLength="500"
                  autoFocus
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
                
                {/* Character counter */}
                <motion.div 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-white/40"
                  animate={{ opacity: message.length > 400 ? 1 : 0 }}
                >
                  {message.length}/500
                </motion.div>
              </div>
              
              <motion.button
                type="submit"
                disabled={!message.trim() || isSending}
                className="btn-primary px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                whileHover={{ 
                  scale: (message.trim() && !isSending) ? 1.05 : 1,
                  rotate: (message.trim() && !isSending) ? 2 : 0
                }}
                whileTap={{ scale: (message.trim() && !isSending) ? 0.95 : 1 }}
                animate={message.trim() && !isSending ? {
                  boxShadow: [
                    '0 20px 40px -12px rgba(147, 51, 234, 0.4)',
                    '0 25px 50px -12px rgba(147, 51, 234, 0.6)',
                    '0 20px 40px -12px rgba(147, 51, 234, 0.4)'
                  ]
                } : {}}
                transition={{ repeat: message.trim() && !isSending ? Infinity : 0, duration: 2 }}
              >
                {isSending ? (
                  <motion.div 
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  />
                ) : (
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Send className="w-6 h-6" />
                  </motion.div>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>

        {/* Enhanced Users Sidebar */}
        <AnimatePresence>
          {showUsers && (
            <motion.div
              className="w-96 hyper-glass-intense border-l border-white/20 relative overflow-hidden"
              initial={{ x: 400, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 400, opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.4, 
                type: 'spring', 
                stiffness: 300,
                damping: 30
              }}
            >
              {/* Sidebar glow effect */}
              <div className="glow-effect absolute inset-0 -z-10" />
              
              <UsersList users={users} currentUsername={room.username} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatRoom;