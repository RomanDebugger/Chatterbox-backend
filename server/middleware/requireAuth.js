import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import User from '../models/Users.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.id).select('_id username active');
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid or inactive user' }); 
    }

    req.user = {
      id: user._id,
      username: user.username,
      active: user.active,
    };
  
    next();

  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
