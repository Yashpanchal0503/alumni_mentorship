# Step-by-Step Deployment Guide - Alumni Mentorship Platform

## Prerequisites

- GitHub account with repository containing this code
- Render account (free tier available)
- Vercel account (free tier available)
- PostgreSQL database (Supabase recommended - free tier available)

---

## Phase 1: Set Up Database (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Choose a region closest to your users
4. Set a strong password for the database
5. Wait for project to be created (2-3 minutes)

### 2. Get Database Connection Strings
1. In Supabase dashboard, go to **Settings > Database**
2. Copy the **Connection String** for:
   - **Transaction Mode** (port 6543) → This is `DATABASE_URL`
   - **Session Mode** (port 5432) → This is `DIRECT_URL`

Example format:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
```

### 3. Generate JWT Secret
Generate a secure random string (minimum 32 characters):
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this as your `JWT_SECRET`.

---

## Phase 2: Deploy Backend to Render

### 1. Connect GitHub to Render
1. Go to [render.com](https://render.com)
2. Sign up and click **"New +"**
3. Select **"Web Service"**
4. Click **"Connect GitHub"** and authorize
5. Select your repository

### 2. Configure Backend Service

**CRITICAL FOR MONOREPO:**
- **Name**: `alumni-mentorship-backend`
- **Branch**: `main`
- **Root Directory**: `backend` ← This is essential for monorepo structure
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Add Environment Variables

In the **Environment** section, add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | Your Supabase Transaction Mode URL |
| `DIRECT_URL` | Your Supabase Session Mode URL |
| `JWT_SECRET` | Your generated JWT secret |
| `FRONTEND_URL` | Leave empty for now (will add after frontend deploy) |

### 4. Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Monitor the **Logs** tab for any errors
4. Once deployed, copy the backend URL: `https://alumni-mentorship-backend.onrender.com`

### 5. Run Database Migrations
After successful deployment:
1. Go to your Render service dashboard
2. Click **"Shell"** tab
3. Run: `npm run prisma:deploy`
4. This will create all database tables

---

## Phase 3: Deploy Frontend to Vercel

### 1. Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up and click **"Add New..." > "Project"**
3. Click **"Import"** next to your GitHub repository

### 2. Configure Frontend Project

**CRITICAL FOR MONOREPO:**
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend` ← This is essential for monorepo structure
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. Add Environment Variable
1. In **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL + `/api`
   - Example: `https://alumni-mentorship-backend.onrender.com/api`

### 4. Deploy
1. Click **"Deploy"**
2. Wait for deployment (1-2 minutes)
3. Once deployed, copy the frontend URL: `https://your-app-name.vercel.app`

---

## Phase 4: Final Configuration

### 1. Update Backend CORS
1. Go back to your Render backend service
2. In **Environment**, update `FRONTEND_URL`:
   - Value: Your Vercel frontend URL
   - Example: `https://your-app-name.vercel.app`
3. Click **"Save Changes"**
4. Render will automatically redeploy

### 2. Verify Deployment

**Test Backend Health:**
```bash
curl https://alumni-mentorship-backend.onrender.com/health
```
Expected response:
```json
{
  "status": "ok",
  "time": "2024-07-06T...",
  "environment": "production"
}
```

**Test Frontend:**
- Open your Vercel URL in browser
- Should load the login page
- Try registering a new user

---

## Phase 5: Test Functionality

### 1. Authentication
- [ ] Register as Student
- [ ] Register as Mentor
- [ ] Login works
- [ ] JWT token is stored

### 2. Mentor Features
- [ ] View mentor list
- [ ] Search mentors
- [ ] View mentor details

### 3. Booking System
- [ ] Create booking as student
- [ ] Accept/reject as mentor
- [ ] Cancel booking

### 4. Forum
- [ ] Create post
- [ ] Add comment
- [ ] Like post

### 5. Dashboard
- [ ] Student dashboard loads
- [ ] Mentor dashboard loads

---

## Troubleshooting

### Backend Deployment Issues

**Error: "Cannot find module"**
- Ensure `rootDir` is set to `backend` in Render
- Check that `package.json` exists in backend folder

**Error: "Database connection failed"**
- Verify DATABASE_URL and DIRECT_URL are correct
- Check Supabase project is active
- Ensure database password is correct

**Error: "JWT_SECRET not set"**
- Add JWT_SECRET environment variable in Render
- Restart the service after adding

**Error: "Prisma Client not generated"**
- The `postinstall` script should handle this
- If fails, run `npm run prisma:generate` in Render Shell

### Frontend Deployment Issues

**Error: "Build failed"**
- Ensure `rootDir` is set to `frontend` in Vercel
- Check that `package.json` exists in frontend folder

**Error: "API requests failing"**
- Verify VITE_API_URL is set correctly
- Must end with `/api`
- Check backend is deployed and running

**Error: "CORS error"**
- Ensure FRONTEND_URL in Render matches Vercel URL
- Backend must be redeployed after updating

**Error: "Blank page"**
- Check Vercel build logs
- Ensure build output directory is `dist`
- Check browser console for errors

### Common Issues

**Monorepo Structure Not Recognized**
- Render: Set "Root Directory" to `backend`
- Vercel: Set "Root Directory" to `frontend`

**Environment Variables Not Loading**
- Ensure keys match exactly (case-sensitive)
- Restart service after adding variables
- Check for typos in values

**Database Migrations Not Running**
- Run `npm run prisma:deploy` in Render Shell
- Or run locally: `DATABASE_URL="..." npx prisma migrate deploy`

---

## Monitoring

### Backend (Render)
- Go to your service dashboard
- **Logs** tab: View real-time logs
- **Metrics** tab: CPU, memory, response time
- **Events** tab: Deployment history

### Frontend (Vercel)
- Go to your project dashboard
- **Deployments** tab: View deployment history
- **Logs** tab: View build logs
- **Analytics** tab: Page views, visitors

---

## Updating the Application

### Backend Updates
```bash
# Make changes locally
git add .
git commit -m "Update backend"
git push origin main

# Render auto-deploys on push to main
```

### Frontend Updates
```bash
# Make changes locally
git add .
git commit -m "Update frontend"
git push origin main

# Vercel auto-deploys on push to main
```

---

## Cost Summary (Free Tier)

| Service | Cost | Limits |
|---------|------|--------|
| Render (Backend) | Free | 750 hours/month, 512MB RAM |
| Vercel (Frontend) | Free | Unlimited bandwidth, 100GB bandwidth |
| Supabase (Database) | Free | 500MB database, 1GB file storage |

**Total: $0/month** (within free tier limits)

---

## Support

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **GitHub Issues**: Check repository issues for known problems

---

## Quick Reference

**Backend URL**: `https://alumni-mentorship-backend.onrender.com`
**Frontend URL**: `https://your-app-name.vercel.app`
**Database**: Supabase (PostgreSQL)
**Health Check**: `https://alumni-mentorship-backend.onrender.com/health`

---

**Deployment Complete!** 🎉
