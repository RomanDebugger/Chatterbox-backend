import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import Message from '../models/Message.js';
import Room from '../models/Room.js';

export const socketInit = (io) => {
  // Authenticate socket connections using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided'));
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Connected: ${socket.userId} (${socket.id})`);

    const userMessageCount = new Map();

    // Join room
    socket.on('join-room', async (roomId) => {
      try {
        const room = await Room.findById(roomId);
        if (!room || !room.participants.some((p) => p.toString() === socket.userId)) {
          return socket.emit('error', { message: 'Unauthorized room access' });
        }

        socket.join(roomId);
        console.log(`${socket.userId} joined room ${roomId}`);

        if (room.type === 'group') {
          const sysMsg = await Message.create({
            room: roomId,
            content: `User ${socket.userId} joined the group.`,
            system: true,
          });
          io.to(roomId).emit('receive-message', {
            ...sysMsg.toObject(),
            sender: { _id: null, username: 'System' },
          });
        }
      } catch (error) {
        console.error(error);
        socket.emit('error', { message: 'Error joining room' });
      }
    });

    // Handle new message
    socket.on('send-message', async ({ roomId, content }) => {
      if (!roomId || !content) return;

      const now = Date.now();
      const limit = 5;
      const interval = 5000;

      const history = userMessageCount.get(socket.userId) || [];
      const recent = history.filter((ts) => now - ts < interval);

      if (recent.length >= limit) {
        return socket.emit('error', { message: 'Too many messages. Slow down.' });
      }

      userMessageCount.set(socket.userId, [...recent, now]);

      try {
        const room = await Room.findById(roomId);
        if (!room || !room.participants.some((p) => p.toString() === socket.userId)) {
          return socket.emit('error', { message: 'Unauthorized to send to this room' });
        }

        const msg = await Message.create({
          room: roomId,
          sender: socket.userId,
          content,
        });
        io.to(roomId).emit('receive-message', {
          ...msg.toObject(),
          sender: { _id: socket.userId },
        });
        console.log(`${socket.userId} → ${roomId}: ${content}`);
      } catch (error) {
        console.error(error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Delivery status
    socket.on('message-delivered', async ({ messageId }) => {
    if (!messageId) return;

    try {
    const message = await Message.findById(messageId);
    if (!message) {
      return socket.emit('error', { message: 'Message not found' });
    }

    const room = await Room.findById(message.room);
    if (!room?.participants.some((p) => p.toString() === socket.userId)) {
      return socket.emit('error', { message: 'Unauthorized' });
    }

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deliveredTo: socket.userId },
    });
    socket.emit('message-status-updated', {
      messageId,
      type: 'delivered',
    });
    } catch (error) {
    console.error(error);
    socket.emit('error', { message: 'Error updating delivery status' });
    }
    });

    // Seen status
    socket.on('message-seen', async ({ messageId }) => {
    if (!messageId) return;

    try {
    const message = await Message.findById(messageId);
    if (!message) {
      return socket.emit('error', { message: 'Message not found' });
    }

    const room = await Room.findById(message.room);
    if (!room?.participants.some((p) => p.toString() === socket.userId)) {
      return socket.emit('error', { message: 'Unauthorized' });
    }

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { seenBy: socket.userId },
    });
    socket.broadcast.emit('message-seen-update', {
      messageId,
      userId: socket.userId,
      type: 'seen',
    });
    } catch (error) {
    console.error(error);
    socket.emit('error', { message: 'Error updating seen status' });
    }
    });

    // Typing indicator
    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('typing', { userId: socket.userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.userId}`);
    });
  });
};
