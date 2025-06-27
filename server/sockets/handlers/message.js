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

      io.to(roomId).emit('receive-message', {
        ...populatedMsg,
        room: roomId
      });

    } catch (err) {
      console.error('Error sending message:', err);
      emitSocketError(socket, {
        code: 500,
        message: 'Internal server error sending message'
      });
    }
  });

  socket.on('message-delivered', async ({ roomId, messageId }) => {
    if (!roomId || !messageId) {
      return emitSocketError(socket, { code: 400, message: 'Room ID and message ID required' });
    }

    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { deliveredTo: socket.userId } },
        { new: true }
      );

      if (!message) {
        return emitSocketError(socket, {
          code: 404,
          message: 'Message not found for delivery'
        });
      }

      io.to(roomId).emit('message-delivered', {
        messageId,
        userId: socket.userId
      });

    } catch (err) {
      console.error('Error marking message delivered:', err);
      emitSocketError(socket, {
        code: 500,
        message: 'Internal server error marking delivered'
      });
    }
  });

  socket.on('message-seen', async ({ roomId, messageId }) => {
    if (!roomId || !messageId) {
      return emitSocketError(socket, { code: 400, message: 'Room ID and message ID required' });
    }

    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { seenBy: socket.userId } },
        { new: true }
      );

      if (!message) {
        return emitSocketError(socket, {
          code: 404,
          message: 'Message not found for seen'
        });
      }

      io.to(roomId).emit('message-seen', {
        messageId,
        userId: socket.userId
      });

    } catch (err) {
      console.error('Error marking message seen:', err);
      emitSocketError(socket, {
        code: 500,
        message: 'Internal server error marking seen'
      });
    }
  });
};
