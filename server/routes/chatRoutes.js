import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js'
import { createRoom, getRoomMessages, sendMessage } from '../controllers/chatController.js'

const router = express.Router();

router.post('/rooms', requireAuth, createRoom);
router.post('/messages', requireAuth, sendMessage);  
router.get('/messages/:roomId', requireAuth, getRoomMessages);

export default router;
