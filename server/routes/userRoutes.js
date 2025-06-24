import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import User from '../models/Users.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/lookup', requireAuth, async (req, res) => {
  try {
    const { usernames } = req.body;
    if (!Array.isArray(usernames)) {
      return res.status(400).json({ error: 'Usernames must be an array' });
    }

    const users = await User.find({
      username: { $in: usernames.map(u => u.toLowerCase()) }
    }).select('_id username').lean();

    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching user IDs:', err);
    res.status(500).json({ error: 'Server error fetching user IDs' });
  }
});

export default router;
