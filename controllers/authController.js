import User from '../models/Users.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import mongoose from 'mongoose';
import { ERRORS, errorResponse } from '../utils/errors.js';

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const reservedUsernames = ['admin', 'root', 'null', 'undefined'];
const minPasswordLength = 6;

export const signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let { username, password } = req.body;
    username = username?.trim().toLowerCase();

    if (!USERNAME_REGEX.test(username)) {
      await session.abortTransaction();
      return errorResponse(res, ERRORS.USERNAME_INVALID);
    }

    if (reservedUsernames.includes(username)) {
      await session.abortTransaction();
      return errorResponse(res, ERRORS.USERNAME_NOT_ALLOWED);
    }

    if (!password || password.length < minPasswordLength) {
      await session.abortTransaction();
      return errorResponse(res, ERRORS.WEAK_PASSWORD);
    }

    const existing = await User.findOne({ username }).session(session);
    if (existing) {
      await session.abortTransaction();
      return errorResponse(res, ERRORS.USERNAME_EXISTS);
    }

    const hashed = await hashPassword(password);
    const [user] = await User.create([{
      username,
      password: hashed
    }], { session });

    const token = generateToken(user._id);

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (err) {
    await session.abortTransaction();
    console.error('Signup error:', err);
    return errorResponse(res, ERRORS.SERVER_ERROR);
  } finally {
    session.endSession();
  }
};

export const login = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username?.trim().toLowerCase();

    const user = await User.findOne({ username })
      .select('+password +active');

    if (!user || !user.active) {
      return errorResponse(res, ERRORS.INVALID_CREDENTIALS);
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return errorResponse(res, ERRORS.INVALID_CREDENTIALS);
    }

    const token = generateToken(user._id);

    const userData = user.toObject();
    delete userData.password;
    delete userData.active;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });

  } catch (err) {
    console.error('Login error:', { message: err.message, stack: err.stack });
    return errorResponse(res, ERRORS.SERVER_ERROR);
  }
};
