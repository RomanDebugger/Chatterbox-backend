import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

import { config } from './config.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

import { socketInit } from './sockets/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);


//middleware setup
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

//Db connnections
mongoose.connect(config.mongoURI,{
    useNewUrlParser : true,
    useUnifiedTopology : true 
})
  .then(()=>{console.log('✅ MongoDB connected')})
  .catch(err => console.error('❌ MongoDB connection error:', err.message));


//routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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
    console.log(`🚀 Chatterbox backend running at http://localhost:${PORT}`);
});
