import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import Message from '../models/Message.js';
import Room from '../models/Room.js';

export const socketInit = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
   console.log("Socket auth token:", token);

    
    if (!token) {
      console.log("No token provided");
      return next(new Error('No token provided'));
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.log("Invalid token");
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Connected: ${socket.userId} (${socket.id})`);

    const userMessageCount = new Map();

    socket.join(socket.userId); 
    console.log(`${socket.userId} joined their personal room`);
    socket.on('create-room', async ({ participantIds, type, name }, callback) => {
      try {
        const currentUserId = socket.userId;
        if (!Array.isArray(participantIds) || participantIds.length === 0) {
          return callback({ error: 'Participants required' });
        } 

        const allParticipants = [...new Set([...participantIds, currentUserId])];

        if (!['private', 'group'].includes(type)) {
          return callback({ error: 'Invalid room type' });
        }

        if (type === 'private' && allParticipants.length === 2) {
          const existingRoom = await Room.findOne({
            type: 'private',
            participants: { $all: allParticipants, $size: 2 }
          });

          if (existingRoom) {
            return callback({ room: existingRoom, message: 'Room exists' });
          }
        }

        const newRoom = await Room.create({
          type,
          name: type === 'group' ? name || 'Group Chat' : undefined,
          participants: allParticipants,
          creator: currentUserId
        });

        if (type === 'group') {
          await Message.create({
            room: newRoom._id,
            content: `Group created by ${currentUserId}`,
            system: true
          });
        }

        callback({ room: newRoom, message: 'Room created' });

        allParticipants.forEach(pId => {
          io.to(pId).emit('new-room', newRoom);
        });

        console.log(` Room created: ${newRoom._id}`);

      } catch (err) {
        console.error('Error creating room:', err);
        callback({ error: 'Server error creating room' });
      }
    });

    // JOIN-ROOM
    socket.on('join-room', async (roomId) => {
  try {
    const room = await Room.findById(roomId);
    if (!room || !room.participants.some((p) => p?.toString() === socket.userId)) {
      return socket.emit('error', { message: 'Unauthorized room access' });
    }

    if (socket.rooms.has(roomId)) {
      console.log(`${socket.userId} is already in room ${roomId}, skipping duplicate join`);
      return;
    }

    socket.join(roomId);
    console.log(`${socket.userId} joined room ${roomId}`);

    if (room.type === 'group') {
      const recentJoinMsg = await Message.findOne({
        room: roomId,
        system: true,
        content: `User ${socket.userId} joined the group.`
      }).sort({ createdAt: -1 }).limit(1);

      if (!recentJoinMsg) {
        const sysMsg = await Message.create({
          room: roomId,
          content: `User ${socket.userId} joined the group.`,
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
      } else {
        console.log(`Skipping system message: ${socket.userId} already has join message`);
      }
    }

  } catch (err) {
    console.error("Error joining room:", err);
    socket.emit('error', { message: 'Error joining room' });
  }
});


    // SEND-MESSAGE
    socket.on('send-message', async ({ roomId, content }) => {
      if (!roomId || !content) return;

      const now = Date.now();
      const limit = 5;
      const interval = 5000;
      const history = userMessageCount.get(socket.userId) || [];
      const recent = history.filter((ts) => now - ts < interval);

      if (recent.length >= limit) {
        console.log(`Rate limit hit for user ${socket.userId}`);
        return socket.emit('error', { message: 'Too many messages. Slow down.' });
      }

      userMessageCount.set(socket.userId, [...recent, now]);

      try {
        const room = await Room.findById(roomId);
        if (!room || !room.participants.some((p) => p?.toString() === socket.userId)) {
          return socket.emit('error', { message: 'Unauthorized to send to this room' });
        }

        const newMsg = await Message.create({
          room: roomId,
          sender: socket.userId,
          content
        });

        const populatedMsg = await Message.findById(newMsg._id)
          .populate('sender', 'username')
          .lean();

        io.to(roomId).emit('receive-message', {
          ...populatedMsg,
          room: roomId
        });

        console.log(` ${socket.userId} → ${roomId}: ${content}`);

      } catch (err) {
        console.error("Error sending message:", err);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    socket.on('typing', (roomId) => {
    socket.to(roomId).emit('typing', { userId: socket.userId });
    });

    socket.on('stop-typing', (roomId) => {
    socket.to(roomId).emit('stop-typing', socket.userId);
    });

    socket.on('leave-room',(roomId) => {
      socket.leave(roomId);
      console.log(`${socket.userId} left room ${roomId}`);
    });


    socket.on('message-delivered', async ({ roomId, messageId }) => {
  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { deliveredTo: socket.userId } }, 
      { new: true }
    );
    
    if (!message) {
      return socket.emit('error', { message: 'Message not found for delivery' });
    }

    io.to(roomId).emit('message-delivered', { messageId, userId: socket.userId });

  } catch (err) {
    console.error('Error marking message delivered:', err);
    socket.emit('error', { message: 'Server error marking delivered' });
  }
});

socket.on('message-seen', async ({ roomId, messageId }) => {
  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { seenBy: socket.userId } }, 
      { new: true }
    );
    
    if (!message) {
      return socket.emit('error', { message: 'Message not found for seen' });
    }

    io.to(roomId).emit('message-seen', { messageId, userId: socket.userId });

  } catch (err) {
    console.error('Error marking message seen:', err);
    socket.emit('error', { message: 'Server error marking seen' });
  }
});


    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.userId}`);
    });

  });
};

