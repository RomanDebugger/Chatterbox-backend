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
import { errorResponse, ERRORS } from './utils/errors.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

import { socketInit } from './sockets/init.js';

dotenv.config();
const PORT = config.port;

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



//sockets
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  }
});
socketInit(io);


//Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: ERRORS.TOO_MANY_REQUESTS.message
});

app.use('/api/auth', authLimiter);

//Db connnections
mongoose.connect(config.mongoURI)
  .then(()=>{console.log('MongoDB connected')})
  .catch(err => {
    console.error(ERRORS.DB_CONNECT_FAIL.message, err);
    process.exit(1);
  });


//routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);


//global Error handler
app.use((err, req, res, next) => {
  console.error(`Global error: ${err.message}`);
  errorResponse(res, ERRORS.SERVER_ERROR, err.message);
});


//Booting
server.listen(PORT,()=>{
    console.log(`Chatterbox backend running at http://localhost:${PORT}`);
});
