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
  participants: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    validate: [
      { validator: arr => arr.length >= 2, msg: 'Room must have at least 2 participants' },
      { validator: arr => arr.length <= 256, msg: 'Too many participants in group' }
    ]
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

roomSchema.pre('validate', function (next) {
  if (this.participants.length === 2 && this.type !== 'private') {
    return next(new Error('Type must be private when there are 2 participants'));
  }
  if (this.participants.length > 2 && this.type !== 'group') {
    return next(new Error('Type must be group when more than 2 participants'));
  }
  next();
});

roomSchema.pre('save', function(next) {
  this.participants = this.participants.map(id => id.toString()).sort();
  next();
});

roomSchema.index(
  { type: 1, participants: 1 },
  {
    unique: true,
    partialFilterExpression: { type: 'private' }
  }
);

export default mongoose.model('Room', roomSchema);
