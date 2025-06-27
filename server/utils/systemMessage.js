import Message from '../models/Message.js';

export const sendSystemMessage = async (roomId, content) => {
  return await Message.create({
    room: roomId,
    content,
    system: true,
  });
};
  