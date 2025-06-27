'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initializeSocket, destroySocket } from '@/app/lib/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      destroySocket();
      setSocket(null);
      setConnected(false);
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) return;

    const sock = initializeSocket(token);
    setSocket(sock);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    sock.on('connect', onConnect);
    sock.on('disconnect', onDisconnect);

    return () => {
      sock.off('connect', onConnect);
      sock.off('disconnect', onDisconnect);
      destroySocket();
    };
  }, [user]);

  const emit = useCallback((event, data, ack) => {
    if (socket) socket.emit(event, data, ack);
  }, [socket]);

  const on = useCallback((event, handler) => {
    if (socket) socket.on(event, handler);
  }, [socket]);

  const off = useCallback((event, handler) => {
    if (socket) socket.off(event, handler);
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
