import { useEffect, useState, useCallback } from 'react';
import { api } from '@/app/lib/api';
import { useSocket } from '@/app/contexts/SocketContext';
import { socketEvents } from '@/app/lib/socket';

export function useRooms(user) {
  const { socket, on, off } = useSocket();
  const [rooms, setRooms] = useState([]);

  const loadRooms = useCallback(async () => {
    if (!user) return;
    try {
      const { rooms } = await api.getRooms();
      setRooms(rooms.sort((a, b) => new Date(b?.lastActivityAt || 0) - new Date(a?.lastActivityAt || 0)));
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  }, [user]);

  const createNewRoomWithUser = useCallback(async (username) => {
    try {
      const { users } = await api.getUserIdsByUsernames([username]);
      if (!users.length) {
        alert('User not found');
        return null;
      }
      const { room } = await api.createRoom(users.map(u => u._id));
      setRooms(prev => [...prev, room].sort((a, b) => {
      const dateA = new Date(a?.lastActivityAt || 0);
      const dateB = new Date(b?.lastActivityAt || 0);
      return dateB - dateA;}));
      return room;
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
      return null;
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
  if (!socket) return;
  
  const handleReceiveMessage = (msg) => {
    setRooms(prev => {
      const updated = prev.map(r => 
        r._id === msg.room 
          ? { ...r, lastActivityAt: msg.createdAt } 
          : r
      );
      return updated.sort((a, b) => new Date(b?.lastActivityAt || 0) - new Date(a?.lastActivityAt || 0));
    });
  };

  on(socketEvents.RECEIVE_MESSAGE, handleReceiveMessage);
  return () => off(socketEvents.RECEIVE_MESSAGE, handleReceiveMessage);
}, [socket, on, off]);


  return {
    rooms,
    loadRooms,
    createNewRoomWithUser
  };
}
