import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { signup, login } from '../controllers/authController.js';
import User from '../models/Users.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);



export default router;

