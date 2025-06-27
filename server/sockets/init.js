import { socketAuthMiddleware } from './middleware/auth.js';
import { setupRoomHandlers } from './handlers/room.js';
import { setupMessageHandlers } from './handlers/message.js';
import { setupTypingHandlers } from './handlers/typing.js';
import { emitSocketError } from './utils/emitSocketError.js';
import User from '../models/Users.js';

export const socketInit = (io) => {
  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.userId} (${socket.id})`);

    try {
      const user = await User.findById(socket.userId).select('username');
      socket.username = user?.username || 'Unknown User';
    } catch (err) {
      console.error(`Failed to fetch user info for ${socket.userId}:`, err);
      socket.username = 'Unknown User';

      // Optionally notify client about degraded session
      emitSocketError(socket, {
        code: 500,
        message: 'User info could not be loaded. Some features may not work properly.'
      });
    }

    socket.join(socket.userId);
    console.log(`${socket.userId} joined personal room`);

    // Initialize all handlers
    setupRoomHandlers(io, socket);
    setupMessageHandlers(io, socket);
    setupTypingHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.userId}`);
    });
  });
};
