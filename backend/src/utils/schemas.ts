import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'MENTOR', 'ADMIN']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  photo: z.string().url().optional().or(z.literal('')),
}).strict();

// Mentor schemas
export const updateMentorSchema = z.object({
  domain: z.string().min(1).max(100).optional(),
  company: z.string().min(1).max(100).optional(),
  designation: z.string().min(1).max(100).optional(),
  experience: z.number().int().min(0).max(50).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  languages: z.union([z.string(), z.array(z.string())]).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  photo: z.string().url().optional().or(z.literal('')),
  availability: z.union([z.string(), z.object({ days: z.array(z.string()), timeSlots: z.array(z.string()) })]).optional(),
}).strict();

// Booking schemas
export const createBookingSchema = z.object({
  mentorId: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  duration: z.string().min(1),
  purpose: z.string().min(5, 'Purpose must be at least 5 characters').max(500),
  notes: z.string().max(1000).optional(),
}).strict();

export const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
}).strict();

// Forum schemas
export const createPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000),
  category: z.string().min(1).max(50),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
}).strict();

export const updatePostSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(10).max(10000).optional(),
  category: z.string().min(1).max(50).optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
}).strict();

export const addCommentSchema = z.object({
  postId: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
}).strict();

// Parameter schemas
export const idParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
});
