"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const auth_js_1 = require("./middleware/auth.js");
const auth_js_2 = require("./controllers/auth.js");
const validation_js_1 = require("./middleware/validation.js");
const schemas_js_1 = require("./utils/schemas.js");
const mentors_js_1 = require("./controllers/mentors.js");
const bookings_js_1 = require("./controllers/bookings.js");
const forum_js_1 = require("./controllers/forum.js");
const dashboard_js_1 = require("./controllers/dashboard.js");
const notifications_js_1 = require("./controllers/notifications.js");
const security_js_1 = require("./middleware/security.js");
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use(security_js_1.securityHeaders);
app.use(security_js_1.securityMiddleware);
// CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
const allowedOrigins = isDevelopment
    ? ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000']
    : [process.env.FRONTEND_URL || ''].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, Postman, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (isDevelopment) {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Rate limiting
app.use('/api', rateLimiter_js_1.generalRateLimiter);
// Auth Routes (with stricter rate limiting and validation)
app.post('/api/register', rateLimiter_js_1.authRateLimiter, (0, validation_js_1.validateBody)(schemas_js_1.registerSchema), auth_js_2.register);
app.post('/api/login', rateLimiter_js_1.authRateLimiter, (0, validation_js_1.validateBody)(schemas_js_1.loginSchema), auth_js_2.login);
app.get('/api/profile', auth_js_1.authenticateJWT, auth_js_2.getProfile);
app.put('/api/profile', auth_js_1.authenticateJWT, (0, validation_js_1.validateBody)(schemas_js_1.updateProfileSchema), auth_js_2.updateProfile);
// Mentor Profile Routes
app.get('/api/mentors', mentors_js_1.getMentors);
app.get('/api/mentors/:id', (0, validation_js_1.validateParams)(schemas_js_1.idParamSchema), mentors_js_1.getMentorById);
app.put('/api/mentor/:id', auth_js_1.authenticateJWT, (0, validation_js_1.validateParams)(schemas_js_1.idParamSchema), (0, validation_js_1.validateBody)(schemas_js_1.updateMentorSchema), mentors_js_1.updateMentor);
app.delete('/api/mentor/:id', auth_js_1.authenticateJWT, (0, auth_js_1.authorizeRoles)('ADMIN'), (0, validation_js_1.validateParams)(schemas_js_1.idParamSchema), mentors_js_1.deleteMentor);
// Booking Routes (with rate limiting and validation)
app.post('/api/booking', auth_js_1.authenticateJWT, rateLimiter_js_1.bookingRateLimiter, (0, validation_js_1.validateBody)(schemas_js_1.createBookingSchema), bookings_js_1.createBooking);
app.get('/api/booking', auth_js_1.authenticateJWT, bookings_js_1.getBookings);
app.put('/api/booking/:id', auth_js_1.authenticateJWT, (0, validation_js_1.validateParams)(schemas_js_1.idParamSchema), (0, validation_js_1.validateBody)(schemas_js_1.updateBookingSchema), bookings_js_1.updateBookingStatus);
app.delete('/api/booking/:id', auth_js_1.authenticateJWT, (0, auth_js_1.authorizeRoles)('ADMIN'), (0, validation_js_1.validateParams)(schemas_js_1.idParamSchema), bookings_js_1.deleteBooking);
// Forum Routes (with rate limiting and validation for write operations)
app.get('/api/posts', forum_js_1.getPosts);
app.get('/api/posts/:id', (0, validation_js_1.validateParams)(schemas_js_1.idParamSchema), forum_js_1.getPostById);
app.post('/api/posts', auth_js_1.authenticateJWT, rateLimiter_js_1.forumRateLimiter, (0, validation_js_1.validateBody)(schemas_js_1.createPostSchema), forum_js_1.createPost);
app.put('/api/posts/:id', auth_js_1.authenticateJWT, rateLimiter_js_1.forumRateLimiter, (0, validation_js_1.validateParams)(schemas_js_1.idParamSchema), (0, validation_js_1.validateBody)(schemas_js_1.updatePostSchema), forum_js_1.updatePost);
app.delete('/api/posts/:id', auth_js_1.authenticateJWT, (0, validation_js_1.validateParams)(schemas_js_1.idParamSchema), forum_js_1.deletePost);
app.post('/api/comments', auth_js_1.authenticateJWT, rateLimiter_js_1.forumRateLimiter, (0, validation_js_1.validateBody)(schemas_js_1.addCommentSchema), forum_js_1.addComment);
app.post('/api/posts/:id/like', (0, validation_js_1.validateParams)(schemas_js_1.idParamSchema), forum_js_1.likePost);
// Dashboard Routes
app.get('/api/dashboard/student', auth_js_1.authenticateJWT, (0, auth_js_1.authorizeRoles)('STUDENT', 'ADMIN'), dashboard_js_1.getStudentDashboard);
app.get('/api/dashboard/mentor', auth_js_1.authenticateJWT, (0, auth_js_1.authorizeRoles)('MENTOR', 'ADMIN'), dashboard_js_1.getMentorDashboard);
app.get('/api/dashboard/admin', auth_js_1.authenticateJWT, (0, auth_js_1.authorizeRoles)('ADMIN'), dashboard_js_1.getAdminDashboard);
// Notification Routes
app.get('/api/notifications', auth_js_1.authenticateJWT, notifications_js_1.getNotifications);
app.put('/api/notifications', auth_js_1.authenticateJWT, notifications_js_1.markAllAsRead);
app.put('/api/notifications/:id', auth_js_1.authenticateJWT, (0, validation_js_1.validateParams)(schemas_js_1.idParamSchema), notifications_js_1.markAsRead);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date(), environment: process.env.NODE_ENV || 'development' });
});
// 404 handler
app.use(errorHandler_js_1.notFoundHandler);
// Global error handler
app.use(errorHandler_js_1.errorHandler);
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
