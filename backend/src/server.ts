import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { authenticateJWT, authorizeRoles } from './middleware/auth.js';
import { register, login, getProfile, updateProfile } from './controllers/auth.js';
import { validateBody, validateParams } from './middleware/validation.js';
import { registerSchema, loginSchema, updateProfileSchema, updateMentorSchema, createBookingSchema, updateBookingSchema, createPostSchema, updatePostSchema, addCommentSchema, idParamSchema } from './utils/schemas.js';
import { getMentors, getMentorById, updateMentor, deleteMentor } from './controllers/mentors.js';
import { createBooking, getBookings, updateBookingStatus, deleteBooking } from './controllers/bookings.js';
import { getPosts, getPostById, createPost, updatePost, deletePost, addComment, likePost } from './controllers/forum.js';
import { getStudentDashboard, getMentorDashboard, getAdminDashboard } from './controllers/dashboard.js';
import { getNotifications, markAsRead, markAllAsRead } from './controllers/notifications.js';
import { securityHeaders, securityMiddleware } from './middleware/security.js';
import { generalRateLimiter, authRateLimiter, bookingRateLimiter, forumRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render deployment (required for express-rate-limit)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(securityMiddleware);

// CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
const allowedOrigins = isDevelopment
  ? ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000']
  : [process.env.FRONTEND_URL || ''].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', generalRateLimiter);

// Auth Routes (with stricter rate limiting and validation)
app.post('/api/register', authRateLimiter, validateBody(registerSchema), register);
app.post('/api/login', authRateLimiter, validateBody(loginSchema), login);
app.get('/api/profile', authenticateJWT, getProfile);
app.put('/api/profile', authenticateJWT, validateBody(updateProfileSchema), updateProfile);

// Mentor Profile Routes
app.get('/api/mentors', getMentors);
app.get('/api/mentors/:id', validateParams(idParamSchema), getMentorById);
app.put('/api/mentor/:id', authenticateJWT, validateParams(idParamSchema), validateBody(updateMentorSchema), updateMentor);
app.delete('/api/mentor/:id', authenticateJWT, authorizeRoles('ADMIN'), validateParams(idParamSchema), deleteMentor);

// Booking Routes (with rate limiting and validation)
app.post('/api/booking', authenticateJWT, bookingRateLimiter, validateBody(createBookingSchema), createBooking);
app.get('/api/booking', authenticateJWT, getBookings);
app.put('/api/booking/:id', authenticateJWT, validateParams(idParamSchema), validateBody(updateBookingSchema), updateBookingStatus);
app.delete('/api/booking/:id', authenticateJWT, authorizeRoles('ADMIN'), validateParams(idParamSchema), deleteBooking);

// Forum Routes (with rate limiting and validation for write operations)
app.get('/api/posts', getPosts);
app.get('/api/posts/:id', validateParams(idParamSchema), getPostById);
app.post('/api/posts', authenticateJWT, forumRateLimiter, validateBody(createPostSchema), createPost);
app.put('/api/posts/:id', authenticateJWT, forumRateLimiter, validateParams(idParamSchema), validateBody(updatePostSchema), updatePost);
app.delete('/api/posts/:id', authenticateJWT, validateParams(idParamSchema), deletePost);
app.post('/api/comments', authenticateJWT, forumRateLimiter, validateBody(addCommentSchema), addComment);
app.post('/api/posts/:id/like', validateParams(idParamSchema), likePost);

// Dashboard Routes
app.get('/api/dashboard/student', authenticateJWT, authorizeRoles('STUDENT', 'ADMIN'), getStudentDashboard);
app.get('/api/dashboard/mentor', authenticateJWT, authorizeRoles('MENTOR', 'ADMIN'), getMentorDashboard);
app.get('/api/dashboard/admin', authenticateJWT, authorizeRoles('ADMIN'), getAdminDashboard);

// Notification Routes
app.get('/api/notifications', authenticateJWT, getNotifications);
app.put('/api/notifications', authenticateJWT, markAllAsRead);
app.put('/api/notifications/:id', authenticateJWT, validateParams(idParamSchema), markAsRead);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date(), environment: process.env.NODE_ENV || 'development' });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
