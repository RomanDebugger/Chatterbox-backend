import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true ,
  },
  password: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,  
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
    