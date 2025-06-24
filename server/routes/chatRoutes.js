import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js'
import { createRoom, getRoomMessages, sendMessage,getUserRooms } from '../controllers/chatController.js'

const router = express.Router();

router.post('/rooms', requireAuth, createRoom);
// router.post('/messages', requireAuth, sendMessage);  
router.get('/messages/:roomId', requireAuth, getRoomMessages);
router.get('/rooms', requireAuth, getUserRooms);

export default router;
