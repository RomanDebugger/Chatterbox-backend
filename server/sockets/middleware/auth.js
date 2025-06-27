import jwt from 'jsonwebtoken';
import { config } from '../../config.js';

export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    const err = new Error('Authentication failed: No token provided');
    err.data = {
      success: false,
      code: 401,
      message: 'No token provided'
    };
    return next(err);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    socket.userId = decoded.id;
    next();
  } catch (verifyErr) {
    console.error(`JWT verification failed for socket ${socket.id}:`, verifyErr);
    const err = new Error('Authentication failed: Invalid token');
    err.data = {
      success: false,
      code: 401,
      message: 'Invalid token'
    };
    next(err);
  }
};
