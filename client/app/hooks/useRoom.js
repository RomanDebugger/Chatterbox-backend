import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/app/lib/api';
import { useSocket } from '@/app/contexts/SocketContext';
import { socketEvents } from '@/app/lib/socket';

export function useRoom(roomId) {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [typingUsers, setTypingUsers] = useState([]);
  const prevRoomId = useRef(null);
  const typingTimeout = useRef(null);
  const { socket, emit, on, off } = useSocket();

  // Load room data
  useEffect(() => {
    if (!roomId) return;

    const load = async () => {
      try {
    const [roomData, messagesData] = await Promise.all([
      api.getRooms(roomId),
      api.getMessages(roomId),
    ]);

    console.log('[DEBUG] messagesData:', messagesData);

    setRoom(roomData);

    const msgs = Array.isArray(messagesData)
      ? messagesData
      : Array.isArray(messagesData.messages)
      ? messagesData.messages
      : [];

    setMessages(msgs);
    console.log('[DEBUG] normalized messages:', msgs);

  } catch (err) {
    console.error('Failed to load room:', err);
  }
    };

    load();
  }, [roomId]);

  useEffect(() => {
  console.log('[DEBUG] messages changed:', messages);
}, [messages]);


  // Handle socket events + room switching
  useEffect(() => {
    if (!socket || !roomId) return;

    if (prevRoomId.current && prevRoomId.current !== roomId) {
      emit(socketEvents.LEAVE_ROOM, prevRoomId.current);
    }
    if (prevRoomId.current !== roomId) {
  if (prevRoomId.current) {
    emit(socketEvents.LEAVE_ROOM, prevRoomId.current);
  }
  emit(socketEvents.JOIN_ROOM, roomId);
  prevRoomId.current = roomId;
}

    prevRoomId.current = roomId;

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev.slice(-99), message]); 

    };

    const handleTyping = ({ userId }) => {
      setTypingUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
    };

    const handleStopTyping = (userId) => {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    };

    const handleStatusUpdate = ({ messageId, userId, type }) => {
      setMessages(prev => prev.map(msg =>
        msg._id === messageId
          ? {
              ...msg,
              deliveredTo: type === 'delivered' 
                ? [...new Set([...(msg.deliveredTo || []), userId])]
                : msg.deliveredTo,
              seenBy: type === 'seen'
                ? [...new Set([...(msg.seenBy || []), userId])]
                : msg.seenBy,
            }
          : msg
      ));
      console.log('[DEBUG] handleNewMessage prev:', prev);
    };

    on(socketEvents.RECEIVE_MESSAGE, handleNewMessage);
    on(socketEvents.TYPING, handleTyping);
    on(socketEvents.STOP_TYPING, handleStopTyping);
    on(socketEvents.MESSAGE_DELIVERED, (data) => handleStatusUpdate({ ...data, type: 'delivered' }));
    on(socketEvents.MESSAGE_SEEN, (data) => handleStatusUpdate({ ...data, type: 'seen' }));

    return () => {
      off(socketEvents.RECEIVE_MESSAGE, handleNewMessage);
      off(socketEvents.TYPING, handleTyping);
      off(socketEvents.STOP_TYPING, handleStopTyping);
      off(socketEvents.MESSAGE_DELIVERED);
      off(socketEvents.MESSAGE_SEEN);
      emit(socketEvents.LEAVE_ROOM, roomId);
    };
  }, [socket, roomId, emit, on, off]);

  // Helper methods
  const sendMessage = useCallback((content) => {
    if (socket && roomId) {
      emit(socketEvents.SEND_MESSAGE, { roomId, content });
    }
  }, [socket, roomId, emit]);

  const sendTyping = useCallback(() => {
    if (!socket || !roomId) return;
    emit(socketEvents.TYPING, roomId);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      emit(socketEvents.STOP_TYPING, roomId);
    }, 2000);
  }, [socket, roomId, emit]);

  const markDelivered = useCallback((messageId) => {
    if (socket && roomId) {
      emit(socketEvents.MESSAGE_DELIVERED, { roomId, messageId });
    }
  }, [socket, roomId, emit]);

  const markSeen = useCallback((messageId) => {
    if (socket && roomId) {
      emit(socketEvents.MESSAGE_SEEN, { roomId, messageId });
    }
  }, [socket, roomId, emit]);

  return {
    room,
    messages,
    typingUsers,
    sendMessage,
    sendTyping,
    markDelivered,
    markSeen,
  };
}
