# Deployment Checklist - Alumni Mentorship Platform

## Pre-Deployment Requirements

### Backend (Render)
- [ ] Set up PostgreSQL database (Supabase recommended)
  - Get DATABASE_URL (Transaction Mode, port 6543)
  - Get DIRECT_URL (Session Mode, port 5432)
- [ ] Generate a strong JWT_SECRET (minimum 32 characters)
- [ ] Create Render account and connect GitHub repository
- [ ] Configure environment variables in Render:
  - `DATABASE_URL` - PostgreSQL connection string
  - `DIRECT_URL` - Direct PostgreSQL connection string
  - `JWT_SECRET` - Strong random string for JWT signing
  - `FRONTEND_URL` - Your Vercel frontend URL
  - `PORT` - 5000 (default)
  - `NODE_ENV` - production
- [ ] Run database migrations: `npm run prisma:deploy` (or manually in Render)
- [ ] (Optional) Run database seed if needed for initial data

### Frontend (Vercel)
- [ ] Create Vercel account and connect GitHub repository
- [ ] Configure environment variable in Vercel:
  - `VITE_API_URL` - Your Render backend URL (must end with /api)
- [ ] Deploy to Vercel (automatic on push to main branch)
- [ ] Update backend `FRONTEND_URL` environment variable with Vercel URL

## Security Verification

### Backend Security
- [x] JWT_SECRET is set in environment variables (no hardcoded fallback)
- [x] CORS properly configured for production
- [x] Rate limiting implemented (general, auth, booking, forum)
- [x] Security headers (Helmet) configured
- [x] Input validation (Zod) on all API endpoints
- [x] Error handling middleware (404, 500)
- [x] Proper logging with Morgan
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS protection (security headers)
- [x] Request body size limit (10mb)

### Frontend Security
- [x] Environment variables for API URL
- [x] No sensitive data in client-side code
- [x] Proper JWT token handling (localStorage)
- [x] Route guards for authenticated pages

## Functionality Testing

### Authentication
- [ ] User registration works (Student, Mentor, Admin)
- [ ] User login works
- [ ] JWT token generation and validation
- [ ] Profile updates work
- [ ] Role-based access control works

### Mentor Features
- [ ] Mentor listing page loads
- [ ] Mentor search and filters work
- [ ] Mentor details page loads
- [ ] Mentor profile updates work
- [ ] Mentor deletion (Admin only)

### Booking System
- [ ] Students can create booking requests
- [ ] Mentors can view booking requests
- [ ] Mentors can accept/reject bookings
- [ ] Students can cancel bookings
- [ ] Admin can delete bookings
- [ ] Booking notifications work

### Forum
- [ ] View all posts
- [ ] Create new posts (authenticated)
- [ ] Update own posts
- [ ] Delete own posts (or admin)
- [ ] Add comments
- [ ] Like posts
- [ ] Search and filter posts

### Dashboard
- [ ] Student dashboard loads with correct data
- [ ] Mentor dashboard loads with correct data
- [ ] Admin dashboard loads with correct data
- [ ] Dashboard metrics are accurate

### Notifications
- [ ] Notifications are created for relevant actions
- [ ] Notifications can be marked as read
- [ ] All notifications can be marked as read
- [ ] Notification count updates correctly

## Performance & Optimization

- [x] Code compiles without errors or warnings
- [x] Frontend build optimized (minified, gzipped)
- [x] Backend TypeScript compilation successful
- [x] Prisma client generated successfully
- [x] No unused dependencies
- [x] No duplicate code
- [x] Clean folder structure

## Deployment Steps

### 1. Deploy Backend to Render
```bash
# Push code to GitHub
git add .
git commit -m "Production ready: security, validation, deployment config"
git push origin main

# In Render dashboard:
# 1. Create new web service
# 2. Connect GitHub repository
# 3. Select backend folder as root directory
# 4. Configure build command: npm install && npm run build
# 5. Configure start command: npm start
# 6. Add environment variables
# 7. Deploy
```

### 2. Deploy Frontend to Vercel
```bash
# In Vercel dashboard:
# 1. Create new project
# 2. Connect GitHub repository
# 3. Select frontend folder as root directory
# 4. Configure build command: npm run build
# 5. Configure output directory: dist
# 6. Add VITE_API_URL environment variable
# 7. Deploy
```

### 3. Post-Deployment Configuration
```bash
# Update backend FRONTEND_URL in Render with Vercel URL
# Test health endpoint: https://your-backend.onrender.com/health
# Test frontend: https://your-app.vercel.app
# Test API endpoints
# Verify CORS is working
# Test authentication flow
```

## Environment Variables Reference

### Backend (.env)
```
DATABASE_URL="postgresql://user:pass@host:6543/dbname?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
FRONTEND_URL="https://your-app.vercel.app"
PORT=5000
NODE_ENV=production
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

## Monitoring & Maintenance

- [ ] Set up error monitoring (e.g., Sentry) - optional
- [ ] Set up analytics - optional
- [ ] Monitor Render logs for errors
- [ ] Monitor Vercel deployments
- [ ] Regular database backups (handled by Supabase)
- [ ] Keep dependencies updated
- [ ] Monitor rate limiting effectiveness

## Rollback Plan

If deployment fails:
1. Revert to previous commit in GitHub
2. Render and Vercel will auto-redeploy on push
3. Or manually redeploy previous version in dashboard

## Support & Troubleshooting

### Common Issues
- **CORS errors**: Verify FRONTEND_URL matches deployed frontend URL
- **Database connection**: Check DATABASE_URL and DIRECT_URL are correct
- **JWT errors**: Ensure JWT_SECRET is set and matches between environments
- **Build failures**: Check logs for specific error messages
- **Rate limiting**: Adjust limits in `middleware/rateLimiter.ts` if needed

### Logs Access
- Backend: Render Dashboard > Logs
- Frontend: Vercel Dashboard > Logs

## Contact
For issues or questions, refer to:
- Backend logs in Render dashboard
- Frontend logs in Vercel dashboard
- GitHub issues for code-related problems
