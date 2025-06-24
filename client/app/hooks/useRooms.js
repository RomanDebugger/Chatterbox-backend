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
      setRooms(rooms);
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
      setRooms(prev => [...prev, room]);
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
    const handleNewRoom = (newRoom) => {
      setRooms(prev => prev.some(r => r._id === newRoom._id) ? prev : [...prev, newRoom]);
    };
    on(socketEvents.NEW_ROOM, handleNewRoom);
    return () => off(socketEvents.NEW_ROOM, handleNewRoom);
  }, [socket, on, off]);

  return {
    rooms,
    loadRooms,
    createNewRoomWithUser
  };
}
