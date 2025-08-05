import { useState, useEffect, useRef } from 'react';

export const useChat = () => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState(null);
  const pollingInterval = useRef(null);
  const pollingDelay = useRef(3000); // Start with 3 second delay

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:5000';

  // Join room function
  const joinRoom = async (roomCode, username, settings) => {
    try {
      // Try to get existing userId from localStorage for this room
      const storageKey = `chatroom_${roomCode}_userId`;
      const existingUserId = localStorage.getItem(storageKey);
      
      const response = await fetch(`${API_BASE}/api/join-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode,
          username,
          settings,
          userId: existingUserId // Include existing userId if available
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Store userId in localStorage for future reconnections
        localStorage.setItem(storageKey, data.userId);
        
        // Initialize messages with proper format
        const initialMessages = data.messages.map(msg => ({
          ...msg,
          viewedBy: msg.viewedBy || [],
          viewCount: msg.viewCount || 0,
          totalUsers: data.users.length,
          isExpired: msg.isExpired || false
        }));
        
        setCurrentRoom({
          roomCode: data.roomCode,
          username: data.username,
          users: data.users,
          messages: initialMessages,
          settings: data.settings
        });
        setMessages(initialMessages);
        setUsers(data.users);
        setUserId(data.userId);
        setIsConnected(true);

        // Start polling for new messages
        startPolling(data.roomCode, data.userId);
        
        return { success: true, data };
      } else {
        throw new Error(data.error || 'Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      return { success: false, error: error.message };
    }
  };

  // Send message function
  const sendMessage = async (text) => {
    if (!currentRoom || !userId) return;

    try {
      const response = await fetch(`${API_BASE}/api/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode: currentRoom.roomCode,
          userId,
          text,
          username: currentRoom.username // Include username as fallback
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Message will be picked up by polling
        return { success: true };
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  };

  // Start polling for new messages and users
  const startPolling = (roomCode, currentUserId) => {
    if (pollingInterval.current) {
      clearTimeout(pollingInterval.current);
    }

    const poll = async () => {
      try {
        // Use POST to mark messages as viewed if we have a userId
        if (currentUserId) {
          const response = await fetch(`${API_BASE}/api/room-messages/${roomCode}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUserId
            })
          });
          
          if (response.ok) {
            try {
              const data = await response.json();
              
              if (data.messages) {
                setMessages(data.messages);
                setUsers(data.users);
              }
              // Reset polling delay on success
              pollingDelay.current = 3000;
              // Schedule next poll
              pollingInterval.current = setTimeout(poll, pollingDelay.current);
              return; // Success, no need for fallback
            } catch (jsonError) {
              console.error('JSON parsing error in polling:', jsonError);
              // Try to get response text for debugging
              try {
                const responseText = await response.clone().text();
                console.log('Response text:', responseText);
              } catch (textError) {
                console.error('Could not read response text:', textError);
              }
            }
          } else {
            console.warn(`Polling failed for room ${roomCode}:`, response.status);
            // Increase delay if rate limited
            if (response.status === 429) {
              pollingDelay.current = Math.min(pollingDelay.current * 2, 10000); // Max 10 seconds
              console.log(`Rate limited, increasing polling delay to ${pollingDelay.current}ms`);
            }
          }
        }
        
        // Fallback to GET request if POST fails or no userId
        try {
          const fallbackResponse = await fetch(`${API_BASE}/api/room-messages/${roomCode}`);
          if (fallbackResponse.ok) {
            try {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.messages) {
                setMessages(fallbackData.messages);
                setUsers(fallbackData.users);
              }
            } catch (fallbackJsonError) {
              console.error('JSON parsing error in fallback:', fallbackJsonError);
              const fallbackText = await fallbackResponse.clone().text();
              console.log('Fallback response text:', fallbackText);
            }
          }
        } catch (fallbackError) {
          console.error('Fallback polling also failed:', fallbackError);
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
      
      // Schedule next poll with current delay
      pollingInterval.current = setTimeout(poll, pollingDelay.current);
    };

    // Start first poll
    poll();
  };

  // Leave room function
  const leaveRoom = () => {
    if (pollingInterval.current) {
      clearTimeout(pollingInterval.current);
    }
    
    // Clear localStorage for this room
    if (currentRoom) {
      const storageKey = `chatroom_${currentRoom.roomCode}_userId`;
      localStorage.removeItem(storageKey);
    }
    
    setCurrentRoom(null);
    setMessages([]);
    setUsers([]);
    setUserId(null);
    setIsConnected(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearTimeout(pollingInterval.current);
      }
    };
  }, []);

  return {
    currentRoom,
    messages,
    users,
    isConnected,
    userId,
    joinRoom,
    sendMessage,
    leaveRoom
  };
};