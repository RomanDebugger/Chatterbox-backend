import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js'
import { getRoomMessages, getUserRooms } from '../controllers/chatController.js'

const router = express.Router();


router.get('/messages/:roomId', requireAuth, getRoomMessages);
router.get('/rooms', requireAuth, getUserRooms);

export default router;
