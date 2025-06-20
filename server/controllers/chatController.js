import Room from '../models/Room.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';

export const createRoom = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { participantIds, type, name } = req.body;
    const currentUserId = req.user.id;

    // Validation
    if (!['private', 'group'].includes(type)) {
      return res.status(400).json({ error: 'Invalid room type' });
    }

    if (!Array.isArray(participantIds)) {
      return res.status(400).json({ error: 'Participants must be an array' });
    }

    
    const allParticipants = [...new Set([...participantIds, currentUserId])];

    // For private chats, check if exists
    if (type === 'private' && allParticipants.length === 2) {
      const existingRoom = await Room.findOne({
        type: 'private',
        participants: { $all: allParticipants, $size: 2 }
      }).session(session);

      if (existingRoom) {
        await session.commitTransaction();
        return res.status(200).json({ 
          message: 'Room exists', 
          room: existingRoom 
        });
      }
    }

    // Create new room
    const room = await Room.create([{
      type,
      name: type === 'group' ? name || 'Group Chat' : undefined,
      participants: allParticipants,
      creator: currentUserId
    }], { session });

    // welcome message for groups
    if (type === 'group') {
      await Message.create([{
        room: room[0]._id,
        content: `Group created by ${req.user.username}`,
        system: true,
        metadata: { action: 'room_created' }
      }], { session });
    }

    await session.commitTransaction();
    res.status(201).json({ message: 'Room created', room: room[0] });

  } catch (err) {
    await session.abortTransaction();
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Server error creating room' });
  } finally {
    session.endSession();
  }
};

export const sendMessage = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { content, roomId } = req.body;
    const currentUserId = req.user.id;

    // Validate input
    if (!content || !roomId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    // Check room access
    const room = await Room.findOne({
      _id: roomId,
      participants: currentUserId
    }).session(session);

    if (!room) {
      return res.status(403).json({ error: 'Not in this room' });
    }

    // Create message
    const [message] = await Message.create([{
      room: roomId,
      sender: currentUserId,
      content,
      deliveredTo: [currentUserId] 
    }], { session });

    
    await Room.findByIdAndUpdate(
      roomId,
      { $set: { lastMessage: message._id } },
      { session }
    );

    await session.commitTransaction();

    
    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'username avatar')
      .lean();

    res.status(201).json({ message: populatedMsg });

  } catch (err) {
    await session.abortTransaction();
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error sending message' });
  } finally {
    session.endSession();
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
      return res.status(403).json({ error: 'Not in this room' });
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

    res.status(200).json({ 
      messages: enriched.reverse()  
    });

  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
};