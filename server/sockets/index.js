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

    // Join a room (private or group)
    socket.on('join-room', async (roomId) => {
      const room = await Room.findById(roomId);
      if (!room || !room.participants.includes(socket.userId)) {
        return socket.emit('error', { message: 'Unauthorized room access' });
      }

      socket.join(roomId);
      console.log(`${socket.userId} joined room ${roomId}`);

      // Send system message if it's a group
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
    });
     
    // Handle new message
    const userMessageCount = new Map();
    socket.on('send-message', async ({ roomId, content }) => {
      if (!roomId || !content) return;
      const now = Date.now();
      const limit = 5; 
      const interval = 5000;

      const history = userMessageCount.get(socket.userId) || [];
      const recent = history.filter(ts => now - ts < interval);

      if (recent.length >= limit) {
      return socket.emit('error', { message: 'Too many messages. Slow down.' });
      }

      userMessageCount.set(socket.userId, [...recent, now]);
  
      const room = await Room.findById(roomId);
      if (!room || !room.participants.includes(socket.userId)) {
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
    });

    // Handle message delivery status
    socket.on('message-delivered', async ({ messageId }) => {
      if (!messageId) return;
      await Message.findByIdAndUpdate(messageId, { $addToSet: { deliveredTo: socket.userId } });
      socket.emit('message-status-updated', { messageId, type: 'delivered' });
    });

    // Handle message seen status
    socket.on('message-seen', async ({ messageId }) => {
      if (!messageId) return;
      await Message.findByIdAndUpdate(messageId, {  $addToSet: { seenBy: socket.userId } });
      socket.broadcast.emit('message-seen-update', { messageId, userId: socket.userId, type: 'seen' });
    });

    // Typing indicator
    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('typing', { userId: socket.userId });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.userId}`);
    });
  });
};
