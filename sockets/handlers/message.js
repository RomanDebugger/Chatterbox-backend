import Room from '../../models/Room.js';
import Message from '../../models/Message.js';
import { emitSocketError } from '../utils/emitSocketError.js';

const userMessageCount = new Map();

export const setupMessageHandlers = (io, socket) => {
  socket.on('send-message', async ({ roomId, content }) => {
    if (!roomId || !content) {
      return emitSocketError(socket, { code: 400, message: 'Room ID and content required' });
    }

    const now = Date.now();
    const limit = 5;
    const interval = 5000;

    const history = userMessageCount.get(socket.userId) || [];
    const recent = history.filter(ts => now - ts < interval);

    if (recent.length >= limit) {
      return emitSocketError(socket, {
        code: 429,
        message: 'Too many messages. Slow down.'
      });
    }

    userMessageCount.set(socket.userId, [...recent, now]);

    try {
      const room = await Room.findById(roomId);
      if (!room || !room.participants.some(p => p?.toString() === socket.userId)) {
        return emitSocketError(socket, {
          code: 403,
          message: 'Unauthorized to send to this room'
        });
      }

      const newMsg = await Message.create({
        room: roomId,
        sender: socket.userId,
        content
      });

      await Room.findByIdAndUpdate(roomId, { lastActivityAt: now });

      const populatedMsg = await Message.findById(newMsg._id)
        .populate('sender', 'username')
        .lean();

      room.participants.forEach(pId => {
      io.to(pId.toString()).emit('receive-message', {
      ...populatedMsg,
      room: roomId
      });
  });
      

    } catch (err) {
      console.error('Error sending message:', err);
      emitSocketError(socket, {
        code: 500,
        message: 'Internal server error sending message'
      });
    }
  });

  socket.on('message-delivered', async ({ roomId, messageIds }) => {
    if (!roomId || !Array.isArray(messageIds) || messageIds.length === 0) {
      return emitSocketError(socket, { code: 400, message: 'Room ID and message IDs required' });
    }

    try {
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { deliveredTo: socket.userId } }
      );

      io.to(roomId).emit('message-delivered', {
        messageIds,
        userId: socket.userId
      });

    } catch (err) {
      console.error('Error marking delivered:', err);
      emitSocketError(socket, {
        code: 500,
        message: 'Internal server error marking delivered'
      });
    }
  });


  socket.on('message-seen', async ({ roomId, messageIds }) => {
    if (!roomId || !Array.isArray(messageIds) || messageIds.length === 0) {
      return emitSocketError(socket, { code: 400, message: 'Room ID and message IDs required' });
    }

    try {
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { seenBy: socket.userId } }
      );

      io.to(roomId).emit('message-seen', {
        messageIds,
        userId: socket.userId
      });

    } catch (err) {
      console.error('Error marking seen:', err);
      emitSocketError(socket, {
        code: 500,
        message: 'Internal server error marking seen'
      });
    }
  });

};
