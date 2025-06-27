import User from '../models/Users.js';
import { errorResponse, ERRORS } from '../utils/errors.js';

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return errorResponse(res, { code: 404, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Error in getMe:', err);
    return errorResponse(res, ERRORS.SERVER_ERROR);
  }
};

export const getUserIdsByUsernames = async (req, res) => {
  try {
    const { usernames } = req.body;

    if (!Array.isArray(usernames) || usernames.length === 0) {
      return errorResponse(res, { code: 400, message: 'Usernames must be a non-empty array' });
    }

    const users = await User.find({
      username: { $in: usernames.map(u => u.toLowerCase()) }
    }).select('_id username').lean();

    return res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    console.error('Error fetching user IDs:', err);
    return errorResponse(res, ERRORS.SERVER_ERROR);
  }
};