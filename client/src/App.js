import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import JoinRoom from './components/JoinRoom';
import ChatRoom from './components/ChatRoom';
import { useSocket } from './hooks/useSocket';

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setCurrentRoom(null);
    });

    socket.on('room-joined', (data) => {
      setCurrentRoom(data);
      setUsername(data.username);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-joined');
      socket.off('error');
    };
  }, [socket]);

  const handleJoinRoom = (roomCode, userName, settings) => {
    if (socket && isConnected) {
      socket.emit('join-room', {
        roomCode,
        username: userName,
        settings
      });
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
    setCurrentRoom(null);
    setUsername('');
  };

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
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
              isConnected={isConnected}
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
              socket={socket}
              username={username}
              onLeaveRoom={handleLeaveRoom}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;