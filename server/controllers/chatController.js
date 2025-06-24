import Room from '../models/Room.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';
import User from '../models/Users.js';


export const getUserIdsByUsernames = async (req, res) => {
  try {
    const { usernames } = req.body;  
    if (!Array.isArray(usernames)) {
      return res.status(400).json({ error: 'Usernames must be an array' });
    }

    const users = await User.find({
      username: { $in: usernames.map(u => u.toLowerCase()) }
    }).select('_id username').lean();

    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching user IDs:', err);
    res.status(500).json({ error: 'Server error fetching user IDs' });
  }
};


export const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ participants: req.user.id })
      .populate('participants', 'username') 
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ rooms });
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Server error fetching rooms' });
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