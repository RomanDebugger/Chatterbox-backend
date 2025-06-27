export const setupTypingHandlers = (io, socket) => {
  socket.on('typing', (roomId) => {
    if (!roomId) {
      console.warn(`Typing event missing roomId from ${socket.userId}`);
      return;
    }

    socket.to(roomId).emit('typing', {
      userId: socket.userId,
      username: socket.username
    });
  });

  socket.on('stop-typing', (roomId) => {
    if (!roomId) {
      console.warn(`Stop-typing event missing roomId from ${socket.userId}`);
      return;
    }

    socket.to(roomId).emit('stop-typing', {
      userId: socket.userId
    });
  });
};
