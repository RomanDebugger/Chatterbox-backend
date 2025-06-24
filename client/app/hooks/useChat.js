// src/hooks/useChat.js
import { useEffect } from 'react';
import { getSocket, socketEvents } from '@/lib/socket';

export function useChat(roomId, onNewMessage, onTyping, onMessageStatus) {
  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();

    const handleNewMessage = (message) => {
      onNewMessage(message);
    };

    const handleTyping = ({ userId }) => {
      onTyping(userId, true);
    };

    const handleStopTyping = (userId) => {
      onTyping(userId, false);
    };

    const handleMessageStatus = (update) => {
      onMessageStatus(update);
    };

    socket.on(socketEvents.MESSAGE, handleNewMessage);
    socket.on(socketEvents.TYPING, handleTyping);
    socket.on(socketEvents.STOP_TYPING, handleStopTyping);
    socket.on(socketEvents.MESSAGE_DELIVERED, handleMessageStatus);
    socket.on(socketEvents.MESSAGE_SEEN, handleMessageStatus);

    return () => {
      socket.off(socketEvents.MESSAGE, handleNewMessage);
      socket.off(socketEvents.TYPING, handleTyping);
      socket.off(socketEvents.STOP_TYPING, handleStopTyping);
      socket.off(socketEvents.MESSAGE_DELIVERED, handleMessageStatus);
      socket.off(socketEvents.MESSAGE_SEEN, handleMessageStatus);
    };
  }, [roomId, onNewMessage, onTyping, onMessageStatus]);
}