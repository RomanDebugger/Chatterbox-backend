import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import User from '../models/Users.js';
import { errorResponse, ERRORS } from '../utils/errors.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return errorResponse(res, ERRORS.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('_id username active');

    if (!user || !user.active) {
      return errorResponse(res, ERRORS.FORBIDDEN_USER);
    }

    req.user = {
      id: user._id,
      username: user.username,
      active: user.active,
    };

    next();

  } catch (err) {
    console.error('Auth middleware error:', err.name);
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }
};
