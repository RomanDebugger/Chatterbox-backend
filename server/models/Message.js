import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  deliveredTo: {
    type: [mongoose.Schema.Types.ObjectId],
    ref : 'User',
    default : []
  },
  seenBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default : []
  },
  system: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;
