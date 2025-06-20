import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

import { config } from './config.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';


import { socketInit } from './sockets/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);



//middleware setup
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(cookieParser());
app.use(morgan('dev'));


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', apiLimiter);

//Db connnections
mongoose.connect(config.mongoURI)
  .then(()=>{console.log('MongoDB connected')})
  .catch(err => console.error('MongoDB connection error:', err.message));


//routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

//sockets
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  }
});
socketInit(io);

//Booting
const PORT = config.port;

server.listen(PORT,()=>{
    console.log(`Chatterbox backend running at http://localhost:${PORT}`);
});
