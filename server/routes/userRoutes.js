import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getMe, getUserIdsByUsernames } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', requireAuth, getMe);
router.post('/lookup', requireAuth, getUserIdsByUsernames);

export default router;
