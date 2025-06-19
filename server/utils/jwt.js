import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: '7d',
  });
};
