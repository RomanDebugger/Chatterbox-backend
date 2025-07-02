import Room from '../../models/Room.js';
import Message from '../../models/Message.js';
import User from '../../models/Users.js';
import { emitSocketError } from '../utils/emitSocketError.js';

export const setupRoomHandlers = (io, socket) => {
  socket.on('create-room', async ({ participantIds, type, name }, callback) => {
    try {
      const currentUserId = socket.userId;

      if (!Array.isArray(participantIds) || participantIds.length === 0) {
        return emitSocketError(callback, { code: 400, message: 'Participants required' });
      }

      if (!['private', 'group'].includes(type)) {
        return emitSocketError(callback, { code: 400, message: 'Invalid room type' });
      }

      const allParticipants = [...new Set([...participantIds, currentUserId])];

      if (type === 'private' && allParticipants.length === 2) {
        const existingRoom = await Room.findOne({
          type: 'private',
          participants: { $all: allParticipants, $size: 2 }
        });
        if (existingRoom) {
          return callback({
            success: true,
            room: existingRoom,
            message: 'Room exists'
          });
        }
      }

      const creator = await User.findById(currentUserId).select('username');
      const creatorName = creator?.username || 'Unknown User';

      const newRoom = await Room.create({
        type,
        name: type === 'group' ? name || 'Group Chat' : undefined,
        participants: allParticipants,
        creator: currentUserId
      });

      if (type === 'group') {
        await Message.create({
          room: newRoom._id,
          content: `Group created by ${creatorName}`,
          system: true
        });
      }

      const populatedRoom = await Room.findById(newRoom._id)
        .populate('participants', 'username')
        .lean();

      callback({
        success: true,
        room: populatedRoom,
        message: 'Room created'
      });

      allParticipants.forEach(pId => io.to(pId).emit('new-room', populatedRoom));

    } catch (err) {
      console.error('Error creating room:', err);
      emitSocketError(callback, { code: 500, message: 'Internal server error while creating room' });
    }
  });

  socket.on('join-room', async (roomId) => {
    try {
      if (!roomId) {
        return emitSocketError(socket, { code: 400, message: 'Room ID required to join' });
      }

      const room = await Room.findById(roomId);
      if (!room || !room.participants.some(p => p?.toString() === socket.userId)) {
        return emitSocketError(socket, { code: 403, message: 'Unauthorized room access' });
      }

      if (socket.rooms.has(roomId)) {
        return;
      }

      socket.join(roomId);

      const user = await User.findById(socket.userId).select('username');
      const username = user?.username || 'Unknown User';

      if (room.type === 'group') {
        const recentJoinMsg = await Message.findOne({
          room: roomId,
          system: true,
          content: `User ${username} joined the group.`
        }).sort({ createdAt: -1 });

        if (!recentJoinMsg) {
          const sysMsg = await Message.create({
            room: roomId,
            content: `User ${username} joined the group.`,
            system: true
          });

          io.to(roomId).emit('receive-message', {
            _id: sysMsg._id,
            room: roomId,
            content: sysMsg.content,
            createdAt: sysMsg.createdAt,
            system: true,
            sender: null
          });
        }
      }

    } catch (err) {
      console.error('Error joining room:', err);
      emitSocketError(socket, { code: 500, message: 'Internal server error while joining room' });
    }
  });

  socket.on('leave-room', (roomId) => {
    if (!roomId) {
      console.warn(`User ${socket.userId} tried to leave without roomId`);
      return;
    }
    socket.leave(roomId);
  });
};
