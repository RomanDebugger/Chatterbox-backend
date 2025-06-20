import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function () {
      return this.type === 'group'; 
    },
    trim: true,
  },
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private',
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

roomSchema.pre('validate', function (next) {
  if (this.participants.length > 2 && this.type !== 'group') {
    this.type = 'group';
  }
  if (this.type === 'group' && !this.name) {
    this.name = 'Chat Group';
  }

  next();
});


export default mongoose.model('Room', roomSchema);
