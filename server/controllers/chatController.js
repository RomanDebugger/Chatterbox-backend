import Room from '../models/Room.js';
import Message from '../models/Message.js';  

 
export const createRoom = async (req, res) => {
  try {
    const { participantIds, type, name } = req.body;

     
    if (!['private', 'group'].includes(type)) {
      return res.status(400).json({ error: 'Invalid room type. Must be "private" or "group".' });
    }

    
    if (!Array.isArray(participantIds) || participantIds.length < 1) {
      return res.status(400).json({ error: 'At least one participant is required' });
    }

 
    const currentUserId = req.user;
    if (!participantIds.includes(currentUserId)) {
      participantIds.push(currentUserId);
    }

 
    if (type === 'private' && participantIds.length === 2) {
      const existing = await Room.findOne({
        type: 'private',
        participants: { $all: participantIds, $size: 2 }
      });

      if (existing) {
        return res.status(200).json({ message: 'Room already exists', room: existing });
      }
    }

    
    const room = await Room.create({
      type,
      name: type === 'group' ? name : undefined,
      participants: participantIds,
      creator: currentUserId,
    });

    res.status(201).json({ message: 'Room created', room });

  } catch (err) {
    console.error('Create room error:', err.message);
    res.status(500).json({ error: 'Server error creating room' });
  }
};

 
export const sendMessage = async (req, res) => {
  try {
    const { content, roomId } = req.body;

    if (!content || !roomId) {
      return res.status(400).json({ error: 'Message content and room ID required' });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

 
    const message = await Message.create({
      room: roomId,
      sender: req.user,
      content,
      deliveredTo : [],
      seenBy : []
    });

    res.status(201).json({ message });

  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ error: 'Server error sending message' });
  }
};
 
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const messages = await Message.find({ room: roomId })
      .sort('createdAt')
      .populate('sender', 'username')
      .lean();
      
    const enriched = messages.map(msg => ({
      ...msg,
      delivered: Array.isArray(msg.deliveredTo) && msg.deliveredTo.includes(req.user),
      seen: Array.isArray(msg.seenBy) && msg.seenBy.includes(req.user),
    })); 

    res.status(200).json({ messages: enriched });

  } catch (err) {
    console.error('Fetch messages error:', err.message);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
};
