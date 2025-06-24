// lib/socket.js
import { io } from 'socket.io-client';
import { SOCKET_URL } from './constants';

let socket;

export const initializeSocket = (token) => {

  if(socket){
    socket.disconnect();
  }

  if (!socket|| !socket.connected) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  console.log("Initializing socket with token:", token);
  console.log('Socket instance:', socket);
console.log('Connecting to URL:', SOCKET_URL);
 socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
socket.on('connect_error', (err) => console.error('❌ Socket connect error:', err.message, err));
socket.on('disconnect', (reason) => console.warn('⚠️ Socket disconnected:', reason));

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error('Socket not initialized');
  return socket;
};

export const socketEvents = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Room events
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  
  // Message events
  MESSAGE: 'message',
  MESSAGE_DELIVERED: 'message-delivered',
  MESSAGE_SEEN: 'message-seen',
  
  // Status events
  TYPING: 'typing',
  STOP_TYPING: 'stop-typing',
  
  // Error events
  ERROR: 'error',
};

export const destroySocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
