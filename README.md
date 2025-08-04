# 📨 Chatterbox Backend
A real-time chat server powering Chatterbox, built using Express, MongoDB, and Socket.IO. Deployed on Render, connected to a Vercel-hosted frontend.

Key Features:
- Secure JWT-based Auth System
- Real-time Chat with Socket.IO
- Group Messaging, System Notifications
- Per-user Read/Delivery Tracking
- Modular Architecture, Middleware & Controllers




## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Real-Time:** Socket.IO
- **Authentication:** JWT, Bcrypt
- **Deployment:** Render (Backend), Vercel (Frontend)
- **Other Tools:** dotenv, CORS, Morgan



## Folder Structure

```

📁 controllers/      → Route logic and business operations
📁 middleware/       → Auth, error handling, etc.  
📁 models/           → Mongoose schemas  
📁 routes/           → Express routes  
📁 utils/            → Utility functions, error enums  
📁 sockets/          → Socket.IO event handlers  

📄 server.js         → Entry point  
📄 config.js         → Environment & configuration

```

> Modular and scalable — each layer handles a specific concern: routing, business logic, middleware, etc.



## Authentication

- JWT-based login/signup
- Passwords hashed with Bcrypt
- Auth middleware (`requireAuth`) checks token & sets `req.user`
- Route access control was handled in the frontend

Endpoints:
- `POST /api/auth/signup`
- `POST /api/auth/login`



## Core Features

### Auth System
- Signup/Login
- JWT issuance and verification

### Chat System
- Join rooms, receive messages
- Typing indicators, seen/delivered tracking
- System messages on key events (e.g., new member)

### Group Support
- Message delivery tracked per user
- Support for system-only messages

### Real-Time with Socket.IO
- Join/leave room
- Emit/receive messages
- User presence & typing status

### Error Handling
- Centralized response handler (`errorResponse`)
- Descriptive error enums in `utils/errors.js`

### CORS + Deployment Fixes
- Supports frontend on Vercel and backend on Render
- Specific CORS configuration for production domains




## API Endpoints

### /api/auth
- POST `/signup` → Create account
- POST `/login` → Login with username/password

### /api/user
- GET `/me` → Get current user
- POST `/lookup` → Get user IDs from usernames

### /api/chat
- GET `/messages/:roomId` → Fetch messages in room
- GET `/rooms` → Fetch user’s rooms



## Real-Time Events (Socket.IO)

All real-time features are implemented using Socket.IO with events organized into modular handler files under /sockets.


### Events List:

| Event Name          | Direction       | Payload / Description                                           |
| ------------------- | --------------- | --------------------------------------------------------------- |
| `send-message`      | Client → Server | `{ roomId, content }` — Send a new chat message                 |
| `receive-message`   | Server → Client | Full message object (with sender populated)                     |
| `message-delivered` | Client → Server | `{ roomId, messageIds[] }` — Mark messages as delivered         |
| `message-seen`      | Client → Server | `{ roomId, messageIds[] }` — Mark messages as seen              |
| `create-room`       | Client → Server | `{ participantIds[], type: 'private' \| 'group', name? }`       |
| `new-room`          | Server → Client | Emits to all participants when a room is created                |
| `join-room`         | Client → Server | `roomId` — Join a room and receive system notification if group |
| `leave-room`        | Client → Server | `roomId` — Leave the specified room                             |
| `typing`            | Client → Server | `roomId` — Notify others that user is typing                    |
| `stop-typing`       | Client → Server | `roomId` — Notify others user stopped typing                    |
| `disconnect`        | Socket Event    | Handles user socket disconnection                               |

### Rate Limiting
 - To prevent spam, message sending is rate-limited:
 - Max 5 messages per 5 seconds per user (send-message event).
 - Violations emit a 429 error via emitSocketError.



## Deployment

### Backend
- Hosted on **Render**
- Handles WebSocket connections (Socket.IO)

### Frontend
- Hosted on **Vercel**

### CORS Config
- Enabled specific origins
- Fixes added for cross-origin auth + websockets




## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/atiwari-0/chatterbox-backend.git
cd chatterbox-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a .env file in root:

```bash
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

### 4. Start the server

```bash
npm run dev
```

## Developer Notes

- Originally a monorepo → split into frontend/backend
- Refactored major parts: auth flow, socket handling, system messages
- Progressive feature addition via Git commits:
  - Added seen/delivered indicators
  - Typing indicators
  - System messages

### Notable Commits:
- `feat: handle multi-user seen/delivered updates`
- `fix(cors): enable Vercel frontend domain in Render backend CORS config`
- `refactor: split repo + flatten server structure`


   
## License

MIT

## Credits

Built by [Akshat Tiwari](https://github.com/RomanDebugger)
