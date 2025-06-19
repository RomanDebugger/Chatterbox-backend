import User from '../models/Users.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

// Only allow lowercase usernames with numbers and underscores, 3-20 chars
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const reservedUsernames = ['admin', 'root', 'null', 'undefined'];

export const signup = async (req, res) => {
  try {
    let { username, password } = req.body;

    // 🔒 Sanitize username input
    username = username?.trim().toLowerCase();

    // 🔍 Validate username format
    if (!USERNAME_REGEX.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3-20 characters, lowercase, and only contain letters, numbers, underscores.'
      });
    }

    // 🚫 Reserved usernames
    if (reservedUsernames.includes(username)) {
      return res.status(400).json({ error: 'This username is not allowed.' });
    }

    // 🔐 Password minimum length check
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // 🧍 Check if username already exists
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // 🔐 Hash password
    const hashed = await hashPassword(password);

    // ✅ Create new user in DB
    const user = await User.create({ username, password: hashed });

    // 🔐 Generate JWT
    const token = generateToken(user._id);

    // 🎉 Send response
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
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

export const login = async (req, res) => {
  try {
    let { username, password } = req.body;

    // 🔒 Sanitize username
    username = username?.trim().toLowerCase();

    // 🔍 Look up user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 🔐 Validate password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 🔐 Issue token
    const token = generateToken(user._id);

    // 🎉 Respond
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt
      },
      token
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};
