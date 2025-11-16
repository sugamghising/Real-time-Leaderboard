# 🎮 Real-Time Leaderboard Backend

A high-performance, real-time leaderboard system built with Node.js, Express, PostgreSQL, Redis, and Socket.IO. Features include user authentication, game management, score tracking, live leaderboards, and direct messaging.

## 🚀 Features

### Core Functionality

- ✅ **JWT Authentication** - Access & refresh token rotation
- ✅ **Role-Based Access Control** - User/Admin permissions
- ✅ **Game Management** - CRUD operations with image uploads
- ✅ **Score Submission** - Real-time score tracking
- ✅ **Live Leaderboards** - Global, per-game, and daily rankings
- ✅ **Direct Messaging** - Real-time chat with unread tracking
- ✅ **WebSocket Support** - Live updates via Socket.IO

### Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express 5.1
- **Database:** PostgreSQL (via Prisma ORM)
- **Cache:** Redis 5.9
- **Real-time:** Socket.IO 4.8
- **Validation:** Zod
- **Auth:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Security:** bcrypt password hashing

---

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 6.x
- Cloudinary account (for image uploads)

---

## 🛠️ Installation

### 1. Clone & Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Setup

Create a `.env` file in the server root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/leaderboard?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_TOKEN_SECRET="your-refresh-token-secret-here"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication

```
POST   /v1/api/auth/register          - Register new user
POST   /v1/api/auth/login             - Login (returns access + refresh tokens)
POST   /v1/api/auth/refresh           - Refresh access token
POST   /v1/api/auth/logout            - Logout (revoke refresh token)
```

### Users

```
GET    /v1/api/users                  - Get all users (auth required)
GET    /v1/api/users/:id              - Get user by ID (auth required)
PUT    /v1/api/users/:id              - Update user (own profile or admin)
DELETE /v1/api/users/:id              - Delete user (own profile or admin)
```

### Games

```
GET    /v1/api/games                  - Get all games (public)
GET    /v1/api/games/:id              - Get game details (public)
POST   /v1/api/games                  - Create game (admin only, supports image)
PUT    /v1/api/games/:id              - Update game (admin only, supports image)
DELETE /v1/api/games/:id              - Delete game (admin only)
```

### Scores

```
POST   /v1/api/scores/:id             - Submit score for game (auth required)
GET    /v1/api/scores/:id/best        - Get user's best score (auth required)
```

### Leaderboards

```
GET    /v1/api/leaderboard/global                - Global leaderboard
GET    /v1/api/leaderboard/game/:id              - Game-specific leaderboard
GET    /v1/api/leaderboard/game/:id/daily        - Daily leaderboard
GET    /v1/api/leaderboard/game/:id/rank         - User's rank (auth required)
```

Query params: `?limit=100` (default: 100)

### Messages

```
POST   /v1/api/messages/                         - Send message (auth required)
GET    /v1/api/messages/conversation/:id         - Get conversation (auth required)
POST   /v1/api/messages/mark-read                - Mark messages as read (auth required)
GET    /v1/api/messages/unread-count             - Get unread count (auth required)
```

---

## 🔌 WebSocket Events

### Client → Server

```javascript
socket.emit("joinGameRoom", gameId); // Join game room for updates
socket.emit("leaveGameRoom", gameId); // Leave game room
```

### Server → Client

```javascript
socket.on("leaderboard:update", (data) => {
  // { gameId, userId, score, rank }
});

socket.on("message:new", (message) => {
  // New message received
});

socket.on("message:sent", (message) => {
  // Message sent confirmation
});

socket.on("message:unread_count", ({ count }) => {
  // Updated unread message count
});
```

### Socket Authentication

```javascript
const socket = io("http://localhost:5000", {
  auth: {
    token: "your-jwt-access-token",
  },
});
```

---

## 📦 Request Examples

### Register User

```bash
POST /v1/api/auth/register
Content-Type: application/json

{
  "username": "player123",
  "email": "player@example.com",
  "password": "securePassword123"
}
```

### Login

```bash
POST /v1/api/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securePassword123"
}

# Response:
{
  "message": "Login Successful",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "userId": "uuid",
    "name": "player123",
    "email": "player@example.com",
    "role": "USER"
  }
}
```

### Create Game (Admin)

```bash
POST /v1/api/games
Authorization: Bearer <admin-access-token>
Content-Type: multipart/form-data

slug: tetris-classic
title: Tetris Classic
description: Classic block-stacking puzzle game
metadata: {"maxLevel": 20, "scoreMultiplier": 100}
image: <file>
```

### Submit Score

```bash
POST /v1/api/scores/:gameId
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "score": 15000,
  "meta": {
    "level": 10,
    "lines": 45,
    "duration": 320
  }
}

# Response:
{
  "success": true,
  "saved": { /* score object */ },
  "leaderboardUpdated": true,
  "rank": 3,
  "score": 15000
}
```

### Get Leaderboard

```bash
GET /v1/api/leaderboard/game/:gameId?limit=50

# Response:
[
  {
    "rank": 1,
    "userId": "uuid",
    "score": 25000,
    "user": {
      "id": "uuid",
      "username": "topplayer",
      "displayName": "Top Player",
      "avatarUrl": "https://..."
    }
  },
  ...
]
```

### Send Message

```bash
POST /v1/api/messages
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "toUserId": "recipient-uuid",
  "content": "Hello! Good game!"
}
```

---

## 🗄️ Database Schema

### Key Models

- **User** - Authentication, profile, roles
- **Game** - Game definitions with metadata
- **Score** - User scores per game
- **Message** - Direct messages between users
- **RefreshToken** - JWT refresh token management
- **Friendship** - Social connections
- **Leaderboard** - Cached in Redis sorted sets

### Indexes

Optimized queries with composite indexes on:

- `Score`: `[gameId, createdAt]`, `[userId]`
- `Message`: `[toUserId, isRead]`, `[fromUserId, createdAt]`, `[toUserId, createdAt]`

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT access tokens (1h expiry)
- ✅ Refresh token rotation (2d expiry)
- ✅ Token revocation on logout
- ✅ Role-based authorization
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ✅ CORS configuration

---

## 🏗️ Project Structure

```
server/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration history
├── src/
│   ├── config/
│   │   ├── db.ts             # Prisma client
│   │   ├── redis.ts          # Redis client
│   │   ├── cloudinary.ts     # Cloudinary config
│   │   └── socket.ts         # Socket.IO setup
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth & role middleware
│   ├── routes/              # API route definitions
│   ├── schemas/             # Zod validation schemas
│   ├── services/            # Business logic
│   ├── types/               # TypeScript types
│   ├── utils/               # Helper functions
│   └── index.ts             # App entry point
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables (Production)

- Set `NODE_ENV=production`
- Use secure JWT secrets (32+ characters)
- Configure production database URL
- Enable Redis persistence
- Set up CORS allowed origins
- Use managed Cloudinary account

### Recommended Services

- **Database:** Railway, Neon, Supabase
- **Redis:** Redis Cloud, Upstash
- **Hosting:** Railway, Render, Fly.io
- **CDN:** Cloudinary (images)

---

## 📊 Performance Features

- **Redis Caching** - Leaderboard data in sorted sets
- **Database Indexes** - Optimized query performance
- **Connection Pooling** - Prisma connection management
- **Pagination** - Cursor-based for messages, limit-based for leaderboards
- **WebSocket** - Efficient real-time updates

---

## 🧪 Testing

### Manual Testing with cURL/Postman

1. Register user → Login → Get tokens
2. Create admin user in DB: `UPDATE "User" SET role = 'ADMIN' WHERE email = '...'`
3. Create games with admin token
4. Submit scores and verify leaderboard updates
5. Test real-time updates with Socket.IO client

### Example Admin Promotion

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## 🐛 Common Issues

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Redis Connection Error

Ensure Redis is running:

```bash
redis-server
# or
docker run -d -p 6379:6379 redis
```

### Database Migration Issues

```bash
npx prisma migrate reset  # ⚠️ Drops all data
npx prisma migrate dev
```

### Port Already in Use

Change `PORT` in `.env` or kill process:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

---

## 📝 Scripts

```json
{
  "start": "node dist/index.js",
  "build": "tsc",
  "dev": "nodemon --watch src --ext ts --exec \"npm run build && npm run start\"",
  "postinstall": "prisma generate"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

ISC

---

## 👨‍💻 Author

Built with ❤️ for real-time gaming experiences

---

## 🔗 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [Redis Commands](https://redis.io/commands/)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Zod Documentation](https://zod.dev/)

---

**Happy Coding! 🎮🚀**
