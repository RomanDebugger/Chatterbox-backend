// src/hooks/useRoom.js
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { socketEvents } from '@/lib/socket';

export function useRoom(roomId) {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const loadInitialData = async () => {
      const [roomData, messagesData] = await Promise.all([
        api.getRoom(roomId),
        api.getMessages(roomId)
      ]);
      setRoom(roomData);
      setMessages(messagesData);
    };

    loadInitialData();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();
    socket.emit(socketEvents.JOIN_ROOM, roomId);

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleTyping = ({ userId }) => {
      setTypingUsers(prev => [...prev, userId]);
    };

    const handleStopTyping = (userId) => {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    };

    socket.on(socketEvents.MESSAGE, handleNewMessage);
    socket.on(socketEvents.TYPING, handleTyping);
    socket.on(socketEvents.STOP_TYPING, handleStopTyping);

    return () => {
      socket.off(socketEvents.MESSAGE, handleNewMessage);
      socket.off(socketEvents.TYPING, handleTyping);
      socket.off(socketEvents.STOP_TYPING, handleStopTyping);
      socket.emit(socketEvents.LEAVE_ROOM, roomId);
    };
  }, [roomId]);

  return { room, messages, typingUsers };
}