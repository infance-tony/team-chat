# 🗨️ Team Chat Application

A production-ready team chat application with admin-managed users and groups, built with Next.js, Express, MongoDB, and Socket.IO.

## 🚀 Features

- **Admin-Only Management**: Single admin creates users and groups
- **Real-Time Messaging**: 1-to-1 and group chats with Socket.IO
- **Role-Based Access**: Admin and member permissions
- **Modern UI**: shadcn/ui components with Tailwind CSS
- **Secure Authentication**: JWT with HTTP-only cookies

## 🛠 Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Socket.IO client
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT + bcrypt
- CORS + cookie-parser

### Hosting
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📁 Project Structure

```
team-chat/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── groups.js
│   │   └── messages.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (redirects to login)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/ (shadcn components)
│   │   │   └── ChatDashboard.tsx
│   │   └── context/
│   │       └── AuthContext.tsx
│   ├── package.json
│   └── .env.local
└── README.md
```

## 🏃‍♂️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values:
   ```
   MONGO_URI=mongodb://localhost:27017/teamchat
   JWT_SECRET=your_super_secret_jwt_key
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   App runs on http://localhost:3000

### First Run
- Admin user is auto-created on server start: `admin@team.com` / `admin123`
- Login as admin to create users and groups
- Create member accounts and start chatting

## 🚀 Deployment

### MongoDB Atlas
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get connection string and update `MONGO_URI` in backend `.env`

### Backend (Render)
1. Push backend code to GitHub
2. Connect to [Render](https://render.com)
3. Create a new Web Service
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables from `.env`
7. Deploy

### Frontend (Vercel)
1. Push frontend code to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Import the project
4. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com`
5. Deploy

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create user (admin only)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `PUT /api/users/status` - Update status
- `DELETE /api/users/:id` - Delete user (admin only)

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group (admin only)
- `PUT /api/groups/:id/add` - Add member (admin only)
- `PUT /api/groups/:id/remove` - Remove member (admin only)
- `DELETE /api/groups/:id` - Delete group (admin only)

### Messages
- `GET /api/messages` - Get messages (with query params)
- `POST /api/messages` - Send message

## 🔌 Socket.IO Events

### Client to Server
- `join-room` - Join a chat room
- `send-message` - Send a message
- `typing` - Indicate typing status
- `status-update` - Update user status

### Server to Client
- `receive-message` - Receive a message
- `user-typing` - User typing indicator
- `user-status` - User status update

## 📝 Notes

- Admin is seeded automatically on first run
- All communications are real-time via WebSockets
- Messages are stored in MongoDB for persistence
- JWT tokens are HTTP-only cookies for security
- CORS is configured for frontend-backend communication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 📄 License

MIT License