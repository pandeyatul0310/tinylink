# Deployment Guide for TinyLink

This guide will walk you through deploying TinyLink to production using Vercel and Neon PostgreSQL.

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Neon account (sign up at [neon.tech](https://neon.tech))

## 🗄️ Step 1: Set Up Database (Neon PostgreSQL)

### 1.1 Create Neon Account

1. Go to [neon.tech](https://neon.tech/)
2. Sign up with GitHub or email
3. Verify your email

### 1.2 Create a New Project

1. Click "New Project"
2. Enter project details:
   - **Name**: `tinylink-db`
   - **Region**: Choose closest to your users
   - **Postgres Version**: Latest (15+)
3. Click "Create Project"

### 1.3 Get Connection String

1. After project creation, you'll see the connection details
2. Copy the **Connection String** (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. **Save this securely** - you'll need it for Vercel

### 1.4 (Optional) Run Migrations Locally First

If you want to test the database connection:

```bash
# In your local .env file
DATABASE_URL="your-neon-connection-string"

# Run migration
npx prisma migrate deploy

# Verify connection
npx prisma studio
```

## 🚀 Step 2: Deploy to Vercel

### 2.1 Push Code to GitHub

1. **Initialize Git** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: TinyLink URL shortener"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name: `tinylink`
   - Make it **Public** (required for assignment submission)
   - Don't initialize with README (you already have one)
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/tinylink.git
   git branch -M main
   git push -u origin main
   ```

### 2.2 Import to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

2. **Import Repository**:
   - Click "Import Git Repository"
   - Find `tinylink` from your repos
   - Click "Import"

3. **Configure Project**:
   - **Project Name**: `tinylink` (or your preferred name)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

### 2.3 Add Environment Variables

In the Vercel import screen, expand "Environment Variables" section:

1. **DATABASE_URL**:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Neon connection string
   - **Environment**: Production, Preview, Development (select all)

2. **NEXT_PUBLIC_BASE_URL**:
   - **Key**: `NEXT_PUBLIC_BASE_URL`
   - **Value**: Leave empty for now (we'll update after deployment)
   - **Environment**: Production, Preview, Development (select all)

3. Click "Deploy"

### 2.4 Wait for Deployment

- Vercel will build and deploy your app
- This takes 2-5 minutes
- You'll see build logs in real-time

### 2.5 Get Your Deployment URL

Once deployed:
1. You'll see a success screen with your URL (e.g., `https://tinylink-xxx.vercel.app`)
2. Click "Visit" to open your deployed app
3. **Copy this URL** - you'll need it for the next step

### 2.6 Update NEXT_PUBLIC_BASE_URL

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Find `NEXT_PUBLIC_BASE_URL`
4. Click "Edit"
5. Change value to your deployment URL: `https://tinylink-xxx.vercel.app`
6. Save
7. Go to "Deployments" and click "Redeploy" on the latest deployment

## 🗃️ Step 3: Run Database Migrations

### Option A: Via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link Project**:
   ```bash
   vercel link
   ```

4. **Pull Environment Variables**:
   ```bash
   vercel env pull .env.production
   ```

5. **Run Migration**:
   ```bash
   DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
   ```

### Option B: Via Local Connection

```bash
# Set the environment variable temporarily
export DATABASE_URL="your-neon-connection-string"

# Run migration
npx prisma migrate deploy

# Unset the variable
unset DATABASE_URL
```

### Option C: Add to Build Script (Not Recommended for First Deploy)

You can add migration to your build command, but this requires careful setup.

## ✅ Step 4: Test Your Deployment

### 4.1 Health Check

```bash
curl https://your-app.vercel.app/healthz
```

Expected response:
```json
{
  "ok": true,
  "version": "1.0",
  "uptime": "...",
  "timestamp": "..."
}
```

### 4.2 Create a Link via API

```bash
curl -X POST https://your-app.vercel.app/api/links \
  -H "Content-Type: application/json" \
  -d '{"targetUrl":"https://github.com","code":"github"}'
```

### 4.3 Test Redirect

Visit: `https://your-app.vercel.app/github`

Should redirect to GitHub.

### 4.4 Test Dashboard UI

1. Visit `https://your-app.vercel.app`
2. Create a link through the form
3. Verify it appears in the table
4. Click to view stats
5. Test the "Copy" button
6. Test deletion

## 🔧 Troubleshooting

### Build Fails with Prisma Error

**Error**: `Prisma Client could not be generated`

**Solution**: Ensure `postinstall` script is in `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Database Connection Error

**Error**: `Can't reach database server`

**Solutions**:
1. Verify `DATABASE_URL` in Vercel environment variables
2. Check Neon database is not paused (free tier auto-pauses after inactivity)
3. Ensure connection string includes `?sslmode=require`
4. Try regenerating Neon connection string

### 404 on All Routes

**Cause**: `NEXT_PUBLIC_BASE_URL` not set correctly

**Solution**:
1. Update to full Vercel URL
2. Redeploy

### Redirect Not Working

**Possible Causes**:
1. Link doesn't exist in database
2. Database migration not run

**Solutions**:
1. Check database with Prisma Studio:
   ```bash
   DATABASE_URL="your-neon-url" npx prisma studio
   ```
2. Verify migration was successful
3. Try creating a link via the UI

### Environment Variables Not Loading

**Solution**: After changing environment variables, you MUST redeploy:
1. Go to Vercel dashboard → Deployments
2. Click ⋯ on latest deployment
3. Click "Redeploy"

## 🎯 Alternative Deployment Options

### Render

1. Create account at [render.com](https://render.com)
2. Create PostgreSQL database
3. Create new Web Service
4. Connect GitHub repo
5. Set environment variables
6. Deploy

### Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy

## 📊 Monitoring

### Vercel Dashboard

- **Analytics**: View page views, performance
- **Logs**: Real-time function logs
- **Deployments**: Track all deployments

### Neon Dashboard

- **Monitoring**: Database performance, connections
- **Query Stats**: Slow queries, most frequent
- **Branches**: Create dev/staging branches

## 🔐 Security Best Practices

1. **Never commit `.env` file** - it's in `.gitignore`
2. **Use Vercel Environment Variables** for secrets
3. **Enable Vercel Authentication** if needed
4. **Set up Neon IP restrictions** in production
5. **Monitor API usage** to prevent abuse

## 💰 Cost Estimation

### Free Tier Limits

**Vercel**:
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function execution

**Neon**:
- 10 GB storage
- 1 active project
- Auto-pause after 5 minutes inactivity

**Estimated Cost**: $0/month for hobby projects

## 🚀 Performance Optimization

### Enable Caching

Add to `next.config.ts`:
```typescript
const nextConfig = {
  headers: async () => [
    {
      source: '/api/links',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=60, stale-while-revalidate=120',
        },
      ],
    },
  ],
};
```

### Database Connection Pooling

Neon provides connection pooling by default. No additional setup needed.

### Edge Functions

Convert API routes to Edge Runtime for lower latency:

```typescript
export const runtime = 'edge';
```

## 📝 Post-Deployment Checklist

- [ ] Health check returns 200
- [ ] Can create links via UI
- [ ] Can create links via API
- [ ] Redirects work (302)
- [ ] Click tracking increments
- [ ] Stats page displays correctly
- [ ] Delete functionality works
- [ ] 404 after delete
- [ ] Search/filter works
- [ ] Mobile responsive
- [ ] Custom codes work
- [ ] Duplicate code returns 409

## 🎓 Submission Checklist

For your assignment submission:

1. **Public URL**: `https://your-app.vercel.app`
2. **GitHub URL**: `https://github.com/YOUR_USERNAME/tinylink`
3. **Video Walkthrough**: Record using Loom/OBS
4. **LLM Transcript**: If you used ChatGPT, export conversation

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

**You're all set! Your TinyLink application is now live. 🎉**
