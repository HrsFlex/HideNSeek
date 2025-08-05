import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import JoinRoom from './components/JoinRoom';
import ChatRoom from './components/ChatRoom';
import { useChat } from './hooks/useChat';

function App() {
  // Enable dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const {
    currentRoom,
    messages,
    users,
    isConnected,
    userId,
    joinRoom,
    sendMessage,
    leaveRoom
  } = useChat();

  const handleJoinRoom = async (roomCode, userName, settings) => {
    setIsConnecting(true);
    
    const result = await joinRoom(roomCode, userName, settings);
    
    setIsConnecting(false);
    
    if (!result.success) {
      toast.error(result.error || 'Failed to join room');
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  const handleSendMessage = async (text) => {
    const result = await sendMessage(text);
    
    if (!result.success) {
      toast.error(result.error || 'Failed to send message');
    }
    
    return result.success;
  };

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: 'modern-card',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
        }}
      />
      
      <AnimatePresence mode="wait">
        {!currentRoom ? (
          <motion.div
            key="join"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <JoinRoom
              onJoinRoom={handleJoinRoom}
              isConnected={!isConnecting}
              isConnecting={isConnecting}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ChatRoom
              room={currentRoom}
              messages={messages}
              users={users}
              userId={userId}
              onSendMessage={handleSendMessage}
              onLeaveRoom={handleLeaveRoom}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;