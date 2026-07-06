"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_js_1 = require("./middleware/auth.js");
const auth_js_2 = require("./controllers/auth.js");
const mentors_js_1 = require("./controllers/mentors.js");
const bookings_js_1 = require("./controllers/bookings.js");
const forum_js_1 = require("./controllers/forum.js");
const dashboard_js_1 = require("./controllers/dashboard.js");
const notifications_js_1 = require("./controllers/notifications.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes logger for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Auth Routes
app.post('/api/register', auth_js_2.register);
app.post('/api/login', auth_js_2.login);
app.get('/api/profile', auth_js_1.authenticateJWT, auth_js_2.getProfile);
app.put('/api/profile', auth_js_1.authenticateJWT, auth_js_2.updateProfile);
// Mentor Profile Routes
app.get('/api/mentors', mentors_js_1.getMentors);
app.get('/api/mentors/:id', mentors_js_1.getMentorById);
app.put('/api/mentor/:id', auth_js_1.authenticateJWT, mentors_js_1.updateMentor);
app.delete('/api/mentor/:id', auth_js_1.authenticateJWT, (0, auth_js_1.authorizeRoles)('ADMIN'), mentors_js_1.deleteMentor);
// Booking Routes
app.post('/api/booking', auth_js_1.authenticateJWT, bookings_js_1.createBooking);
app.get('/api/booking', auth_js_1.authenticateJWT, bookings_js_1.getBookings);
app.put('/api/booking/:id', auth_js_1.authenticateJWT, bookings_js_1.updateBookingStatus);
app.delete('/api/booking/:id', auth_js_1.authenticateJWT, (0, auth_js_1.authorizeRoles)('ADMIN'), bookings_js_1.deleteBooking);
// Forum Routes
app.get('/api/posts', forum_js_1.getPosts);
app.get('/api/posts/:id', forum_js_1.getPostById);
app.post('/api/posts', auth_js_1.authenticateJWT, forum_js_1.createPost);
app.put('/api/posts/:id', auth_js_1.authenticateJWT, forum_js_1.updatePost);
app.delete('/api/posts/:id', auth_js_1.authenticateJWT, forum_js_1.deletePost);
app.post('/api/comments', auth_js_1.authenticateJWT, forum_js_1.addComment);
app.post('/api/posts/:id/like', forum_js_1.likePost);
// Dashboard Routes
app.get('/api/dashboard/student', auth_js_1.authenticateJWT, (0, auth_js_1.authorizeRoles)('STUDENT', 'ADMIN'), dashboard_js_1.getStudentDashboard);
app.get('/api/dashboard/mentor', auth_js_1.authenticateJWT, (0, auth_js_1.authorizeRoles)('MENTOR', 'ADMIN'), dashboard_js_1.getMentorDashboard);
app.get('/api/dashboard/admin', auth_js_1.authenticateJWT, (0, auth_js_1.authorizeRoles)('ADMIN'), dashboard_js_1.getAdminDashboard);
// Notification Routes
app.get('/api/notifications', auth_js_1.authenticateJWT, notifications_js_1.getNotifications);
app.put('/api/notifications', auth_js_1.authenticateJWT, notifications_js_1.markAllAsRead);
app.put('/api/notifications/:id', auth_js_1.authenticateJWT, notifications_js_1.markAsRead);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
