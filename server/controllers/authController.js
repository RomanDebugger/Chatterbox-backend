import User from '../models/Users.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import mongoose from 'mongoose';

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const reservedUsernames = ['admin', 'root', 'null', 'undefined'];

export const signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    let { username, password } = req.body;

    // Validation
    username = username?.trim().toLowerCase();
    
    if (!USERNAME_REGEX.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3-20 lowercase letters, numbers, or underscores'
      });
    }

    if (reservedUsernames.includes(username)) {
      return res.status(400).json({ error: 'Username not allowed' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check existing user in transaction
    const existing = await User.findOne({ username }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Username exists' });
    }

    // Create user
    const hashed = await hashPassword(password);
    const [user] = await User.create([{
      username,
      password: hashed
    }], { session });

    // Generate token
    const token = generateToken(user._id);

    await session.commitTransaction();
    
    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt
      },
      token
    });

  } catch (err) {
    await session.abortTransaction();
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  } finally {
    session.endSession();
  }
};

export const login = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username?.trim().toLowerCase();

    // Find user with active session check
    const user = await User.findOne({ username })
      .select('+password +active')
      .exec();

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token with device info
    const token = generateToken(user._id);

    // Omit sensitive data
    const userData = user.toObject();
    delete userData.password;
    delete userData.active;

    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};