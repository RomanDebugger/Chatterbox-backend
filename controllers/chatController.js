import Room from '../models/Room.js';
import Message from '../models/Message.js';
import { errorResponse, ERRORS } from '../utils/errors.js';

export const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ participants: req.user.id })
      .populate('participants', 'username')
      .sort({ lastActivityAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      rooms
    });
  } catch (err) {
    console.error('Error fetching rooms:', err);
    return errorResponse(res, ERRORS.SERVER_ERROR);
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user.id;

    const room = await Room.findOne({
      _id: roomId,
      participants: currentUserId
    });

    if (!room) {
      return errorResponse(res, { code: 403, message: 'Not in this room' });
    }

    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username avatar')
      .populate('deliveredTo', 'username')
      .populate('seenBy', 'username')
      .lean();

    const enriched = messages.map(msg => ({
      ...msg,
      delivered: msg.deliveredTo.some(user => user._id.equals(currentUserId)),
      seen: msg.seenBy.some(user => user._id.equals(currentUserId))
    }));

    return res.status(200).json({
      success: true,
      messages: enriched.reverse()
    });

  } catch (err) {
    console.error('Fetch messages error:', err);
    return errorResponse(res, ERRORS.SERVER_ERROR);
  }
};
