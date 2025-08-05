import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  const getDisplayText = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing`;
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing`;
    } else {
      return `${users[0].username} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="flex items-center space-x-2 text-white/60 text-sm px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span>{getDisplayText()}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default TypingIndicator;