// src/lib/socket.js
import { io } from 'socket.io-client';
import { SOCKET_URL } from './constants';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    if (socket.auth.token === token) {
      console.log('⚡ Socket already initialized with same token');
      return socket;
    }
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  console.log('🔌 Initializing socket:', SOCKET_URL, 'Token:', token);

  socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
  socket.on('disconnect', (reason) => console.warn('⚠️ Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('❌ Socket connection error:', err.message));
  socket.on('reconnect_attempt', attempt => console.log(`🔄 Reconnect attempt ${attempt}`));
  socket.on('reconnect_failed', () => console.error('❌ Reconnect failed'));
  socket.on('reconnect', attempt => console.log(`✅ Reconnected after ${attempt} attempt(s)`));

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error('Socket not initialized');
  return socket;
};

export const destroySocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🛑 Socket destroyed');
  }
};

export const socketEvents = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Client → Server
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  SEND_MESSAGE: 'send-message',
  TYPING: 'typing',
  STOP_TYPING: 'stop-typing',
  MESSAGE_DELIVERED: 'message-delivered',
  MESSAGE_SEEN: 'message-seen',
  LEAVE_ROOM: 'leave-room',

  // Server → Client
  NEW_ROOM: 'new-room',
  RECEIVE_MESSAGE: 'receive-message',
  MESSAGE_DELIVERED: 'message-delivered',
  MESSAGE_SEEN: 'message-seen',
};

