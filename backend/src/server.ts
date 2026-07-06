import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateJWT, authorizeRoles } from './middleware/auth.js';
import { register, login, getProfile, updateProfile } from './controllers/auth.js';
import { getMentors, getMentorById, updateMentor, deleteMentor } from './controllers/mentors.js';
import { createBooking, getBookings, updateBookingStatus, deleteBooking } from './controllers/bookings.js';
import { getPosts, getPostById, createPost, updatePost, deletePost, addComment, likePost } from './controllers/forum.js';
import { getStudentDashboard, getMentorDashboard, getAdminDashboard } from './controllers/dashboard.js';
import { getNotifications, markAsRead, markAllAsRead } from './controllers/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Auth Routes
app.post('/api/register', register);
app.post('/api/login', login);
app.get('/api/profile', authenticateJWT, getProfile);
app.put('/api/profile', authenticateJWT, updateProfile);

// Mentor Profile Routes
app.get('/api/mentors', getMentors);
app.get('/api/mentors/:id', getMentorById);
app.put('/api/mentor/:id', authenticateJWT, updateMentor);
app.delete('/api/mentor/:id', authenticateJWT, authorizeRoles('ADMIN'), deleteMentor);

// Booking Routes
app.post('/api/booking', authenticateJWT, createBooking);
app.get('/api/booking', authenticateJWT, getBookings);
app.put('/api/booking/:id', authenticateJWT, updateBookingStatus);
app.delete('/api/booking/:id', authenticateJWT, authorizeRoles('ADMIN'), deleteBooking);

// Forum Routes
app.get('/api/posts', getPosts);
app.get('/api/posts/:id', getPostById);
app.post('/api/posts', authenticateJWT, createPost);
app.put('/api/posts/:id', authenticateJWT, updatePost);
app.delete('/api/posts/:id', authenticateJWT, deletePost);
app.post('/api/comments', authenticateJWT, addComment);
app.post('/api/posts/:id/like', likePost);

// Dashboard Routes
app.get('/api/dashboard/student', authenticateJWT, authorizeRoles('STUDENT', 'ADMIN'), getStudentDashboard);
app.get('/api/dashboard/mentor', authenticateJWT, authorizeRoles('MENTOR', 'ADMIN'), getMentorDashboard);
app.get('/api/dashboard/admin', authenticateJWT, authorizeRoles('ADMIN'), getAdminDashboard);

// Notification Routes
app.get('/api/notifications', authenticateJWT, getNotifications);
app.put('/api/notifications', authenticateJWT, markAllAsRead);
app.put('/api/notifications/:id', authenticateJWT, markAsRead);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
