import rateLimit from 'express-rate-limit';

// General rate limiter for all API requests
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for booking creation
export const bookingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 booking requests per hour
  message: { error: 'Too many booking requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for forum posts
export const forumRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 forum posts per hour
  message: { error: 'Too many forum posts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
