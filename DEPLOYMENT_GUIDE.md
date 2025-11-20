# TinyLink Deployment Guide

This guide will walk you through deploying your TinyLink application to Vercel with Neon PostgreSQL database.

## Prerequisites

- A GitHub account
- A Vercel account (sign up at https://vercel.com)
- A Neon account (sign up at https://neon.tech)

---

## Step 1: Set Up Neon PostgreSQL Database

### 1.1 Create Neon Account and Project

1. Go to https://neon.tech and sign up (it's free)
2. Click "Create Project"
3. Choose a project name: `tinylink` (or any name you prefer)
4. Select a region close to your target users
5. Click "Create Project"

### 1.2 Get Database Connection String

1. After project creation, you'll see the connection details
2. Copy the **Connection String** (it looks like this):
   ```
   postgresql://username:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. **Important**: Save this connection string - you'll need it for Vercel

### 1.3 Test Database Connection (Optional)

You can test locally before deploying:
1. Copy your `.env.example` to `.env`
2. Replace the `DATABASE_URL` with your Neon connection string
3. Run:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```

---

## Step 2: Prepare Your Code for Deployment

### 2.1 Initialize Git Repository

```bash
cd /Users/sprinix001/Documents/LMS/test-work/tinylink
git init
git add .
git commit -m "Initial commit: TinyLink application"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `tinylink`
3. **Do NOT initialize** with README, .gitignore, or license
4. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/tinylink.git`)

### 2.3 Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/tinylink.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Import Project from GitHub

1. Go to https://vercel.com and sign in
2. Click "Add New" → "Project"
3. Import your `tinylink` repository from GitHub
4. Click "Import"

### 3.2 Configure Environment Variables

Before clicking "Deploy", you need to add environment variables:

1. In the Vercel import screen, find "Environment Variables" section
2. Add the following variables:

   **Variable 1:**
   - Name: `DATABASE_URL`
   - Value: Your Neon connection string from Step 1.2
   - Example: `postgresql://username:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`

   **Variable 2:**
   - Name: `NEXT_PUBLIC_BASE_URL`
   - Value: Leave this empty for now (we'll add it after first deployment)

3. Click "Deploy"

### 3.3 Wait for Deployment

- Vercel will:
  - Install dependencies
  - Run `prisma generate`
  - Build your Next.js application
  - Deploy it
- This takes 2-5 minutes

### 3.4 Get Your Deployment URL

1. After deployment succeeds, you'll see: "Congratulations! 🎉"
2. Copy your deployment URL (e.g., `https://tinylink-xxxxx.vercel.app`)

### 3.5 Update NEXT_PUBLIC_BASE_URL

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Find `NEXT_PUBLIC_BASE_URL`
4. Click "Edit"
5. Set value to your deployment URL: `https://tinylink-xxxxx.vercel.app`
6. Click "Save"
7. Go to "Deployments" tab
8. Click "..." on the latest deployment → "Redeploy"
9. Select "Redeploy" to apply the environment variable

---

## Step 4: Initialize Database Schema

After deployment, you need to set up the database schema:

### 4.1 Run Prisma Migration

You have two options:

**Option A: Use Vercel CLI (Recommended)**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   cd /Users/sprinix001/Documents/LMS/test-work/tinylink
   vercel link
   ```

4. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

5. Run Prisma migration:
   ```bash
   npx prisma db push
   ```

**Option B: Use Neon SQL Editor**

1. Go to your Neon dashboard
2. Click on "SQL Editor"
3. Run this SQL:
   ```sql
   CREATE TABLE "Link" (
     "id" TEXT NOT NULL,
     "code" TEXT NOT NULL,
     "targetUrl" TEXT NOT NULL,
     "clicks" INTEGER NOT NULL DEFAULT 0,
     "lastClicked" TIMESTAMP(3),
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL,
     CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
   );

   CREATE UNIQUE INDEX "Link_code_key" ON "Link"("code");
   CREATE INDEX "Link_code_idx" ON "Link"("code");
   ```

---

## Step 5: Test Your Deployment

### 5.1 Test Health Endpoint

```bash
curl https://your-app.vercel.app/healthz
```

Expected response:
```json
{"ok":true,"version":"1.0"}
```

### 5.2 Test Creating a Link

1. Go to `https://your-app.vercel.app`
2. Enter a long URL (e.g., `https://www.google.com`)
3. Enter a custom code (e.g., `google`)
4. Click "Shorten"
5. You should see the shortened link created

### 5.3 Test Redirect

1. Visit `https://your-app.vercel.app/google`
2. You should be redirected to `https://www.google.com`

### 5.4 Test Stats Page

1. Go to `https://your-app.vercel.app/code/google`
2. You should see statistics for the link (clicks, creation time, etc.)

### 5.5 Test API Endpoints

```bash
# List all links
curl https://your-app.vercel.app/api/links

# Get specific link
curl https://your-app.vercel.app/api/links/google

# Delete link (optional test)
curl -X DELETE https://your-app.vercel.app/api/links/google
```

---

## Step 6: Prepare for Submission

### 6.1 Update README with Your URLs

Edit the README.md file to include:
- Your live deployment URL
- Your GitHub repository URL
- Setup instructions

### 6.2 Create Video Walkthrough

Record a video covering:
1. **Live Demo** (5-7 minutes):
   - Show the deployed application working
   - Create a short link
   - Test the redirect
   - View statistics
   - Delete a link
   - Show the healthcheck endpoint

2. **Code Walkthrough** (8-10 minutes):
   - Explain the project structure
   - Walk through the main components:
     - Dashboard page ([/app/page.tsx](app/page.tsx))
     - Stats page ([/app/code/[code]/page.tsx](app/code/[code]/page.tsx))
     - Redirect handler ([/app/[code]/page.tsx](app/[code]/page.tsx))
     - API routes ([/app/api/links/route.ts](app/api/links/route.ts))
     - Database schema ([/prisma/schema.prisma](prisma/schema.prisma))
   - Explain key design decisions
   - Explain how you used AI assistance

**Recording Tools:**
- Loom (https://loom.com) - Free, easy to use
- OBS Studio - Free, more features
- macOS: QuickTime Screen Recording

### 6.3 Submission Checklist

Prepare these items:

1. **Live URL**: `https://your-app.vercel.app`
2. **GitHub URL**: `https://github.com/YOUR_USERNAME/tinylink`
3. **Video URL**: Upload to YouTube, Loom, or Google Drive with public access
4. **ChatGPT Transcript**: If you used ChatGPT, export the conversation

---

## Troubleshooting

### Issue: Database Connection Error

**Error**: `Can't reach database server at ...`

**Solution**:
1. Check that `DATABASE_URL` in Vercel environment variables is correct
2. Ensure the Neon database is running (check Neon dashboard)
3. Verify the connection string includes `?sslmode=require`
4. Try redeploying after fixing

### Issue: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
1. Check that `package.json` has the `postinstall` script:
   ```json
   "postinstall": "prisma generate"
   ```
2. Redeploy the application
3. Check Vercel build logs for errors

### Issue: Environment Variable Not Working

**Error**: Short links showing `localhost` in production

**Solution**:
1. Go to Vercel → Settings → Environment Variables
2. Ensure `NEXT_PUBLIC_BASE_URL` is set correctly
3. **Important**: Redeploy after changing environment variables
4. Clear browser cache

### Issue: 404 on Redirect

**Error**: Visiting `/{code}` shows 404

**Solution**:
1. Check that the database has the link:
   ```bash
   curl https://your-app.vercel.app/api/links
   ```
2. Verify the `[code]/page.tsx` file exists in the app directory
3. Check Vercel function logs for errors

### Issue: Clicks Not Incrementing

**Solution**:
1. Check the redirect page implementation
2. Verify database write permissions
3. Check Vercel function logs

---

## Updating Your Deployment

Whenever you make changes to your code:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically redeploy your application!

---

## Cost Breakdown (All Free!)

- **Vercel**: Free tier includes unlimited deployments
- **Neon**: Free tier includes 1 project with 500MB storage
- **GitHub**: Free for public repositories
- **Domain**: Uses free `.vercel.app` subdomain

---

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Build locally
npm run build

# Run production build locally
npm start

# Prisma commands
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to database
npx prisma studio        # Open Prisma Studio GUI

# Git commands
git status
git add .
git commit -m "message"
git push

# Vercel commands
vercel                   # Deploy
vercel --prod            # Deploy to production
vercel logs              # View logs
vercel env pull          # Pull environment variables
```

---

## Success Criteria (from Assignment)

Make sure your deployment meets these requirements:

- ✅ `/healthz` returns 200
- ✅ Creating a link works; duplicate codes return 409
- ✅ Redirect works and increments click count
- ✅ Deletion stops redirect (404)
- ✅ Clean UI with proper states (loading, error, success, empty)
- ✅ Form validation and error messages
- ✅ Responsive design
- ✅ All API endpoints follow the spec
- ✅ Code follows [A-Za-z0-9]{6,8} pattern

---

## Need Help?

If you encounter issues:

1. Check Vercel deployment logs: Go to your project → Deployments → Click on deployment → View logs
2. Check Vercel function logs: Go to your project → Logs
3. Check Neon database: Go to Neon dashboard → SQL Editor → Run queries to inspect data
4. Test locally first: Make sure everything works on `localhost:3000` before deploying

Good luck with your submission! 🚀
