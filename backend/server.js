const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const messageRoutes = require('./routes/messages');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

connectDB();

// Seed admin
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({ name: 'Admin', email: 'admin@team.com', password: hashedPassword, role: 'admin' });
      await admin.save();
      console.log('Admin user created: admin@team.com / admin123');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

seedAdmin();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
  });

  socket.on('send-message', async (data) => {
    const { receiverId, groupId, content, senderId } = data;
    // Emit to room
    const room = groupId ? groupId : receiverId;
    socket.to(room).emit('receive-message', { senderId, content, createdAt: new Date() });
  });

  socket.on('typing', (data) => {
    const { room, isTyping } = data;
    socket.to(room).emit('user-typing', { userId: socket.id, isTyping });
  });

  socket.on('status-update', (data) => {
    io.emit('user-status', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));