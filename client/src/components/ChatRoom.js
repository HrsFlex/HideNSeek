import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, LogOut, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import MessageBubble from './MessageBubble';
import UsersList from './UsersList';
import TypingIndicator from './TypingIndicator';

const ChatRoom = ({ room, socket, username, onLeaveRoom }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(room.messages || []);
  const [users, setUsers] = useState(room.users || []);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    socket.on('user-joined', (user) => {
      toast.success(`${user.username} joined the room`);
    });

    socket.on('user-left', (user) => {
      toast(`${user.username} left the room`, { icon: '👋' });
    });

    socket.on('users-updated', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('user-typing', ({ userId, username: typingUsername, isTyping }) => {
      if (isTyping) {
        setTypingUsers(prev => {
          if (!prev.find(user => user.userId === userId)) {
            return [...prev, { userId, username: typingUsername }];
          }
          return prev;
        });
      } else {
        setTypingUsers(prev => prev.filter(user => user.userId !== userId));
      }
    });

    return () => {
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('users-updated');
      socket.off('user-typing');
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !socket) return;

    socket.emit('send-message', { text: message.trim() });
    setMessage('');
    
    // Stop typing indicator
    socket.emit('typing', false);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!socket) return;

    // Emit typing indicator
    socket.emit('typing', true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', false);
    }, 3000);
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
      {/* Header */}
      <motion.header
        className="glass-effect border-b border-white/10 p-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
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
        {/* Chat Area */}
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <MessageBubble
                  key={msg.id || index}
                  message={msg}
                  isOwn={msg.userId === socket?.id}
                  currentUsername={username}
                />
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            <TypingIndicator users={typingUsers} />
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <motion.div
            className="p-4 glass-effect border-t border-white/10"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={message}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="input-field flex-1"
                maxLength="500"
                autoFocus
              />
              <motion.button
                type="submit"
                disabled={!message.trim()}
                className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: message.trim() ? 1.05 : 1 }}
                whileTap={{ scale: message.trim() ? 0.95 : 1 }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        </motion.div>

        {/* Users Sidebar */}
        <AnimatePresence>
          {showUsers && (
            <motion.div
              className="w-80 glass-effect border-l border-white/10"
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <UsersList users={users} currentUsername={username} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatRoom;