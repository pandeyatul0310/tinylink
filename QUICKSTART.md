# Quick Start Guide

Get TinyLink running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running (or use Neon cloud database)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Database

### Option A: Local PostgreSQL

```bash
# Create database
createdb tinylink

# Copy environment file
cp .env.example .env

# Edit .env and set:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tinylink?schema=public"
# NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Option B: Neon (Cloud PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `.env`:
   ```
   DATABASE_URL="your-neon-connection-string"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

## Step 3: Run Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database schema
- Generate Prisma Client

## Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 5: Test the Application

1. **Create a link**:
   - Fill in Target URL: `https://github.com`
   - Custom Code: `github`
   - Click "Create Short Link"

2. **View the link**:
   - You'll see it in the table below

3. **Test the redirect**:
   - Visit [http://localhost:3000/github](http://localhost:3000/github)
   - You should be redirected to GitHub

4. **View statistics**:
   - Click on the code `github` in the table
   - See click count, last clicked time, etc.

## Verify API Endpoints

```bash
# Health check
curl http://localhost:3000/healthz

# Create link
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"targetUrl":"https://example.com","code":"test123"}'

# List links
curl http://localhost:3000/api/links

# Get link stats
curl http://localhost:3000/api/links/test123

# Test redirect
curl -I http://localhost:3000/test123

# Delete link
curl -X DELETE http://localhost:3000/api/links/test123
```

## Troubleshooting

### "Can't reach database server"

**Solution**: Make sure PostgreSQL is running:
```bash
# macOS (if using Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Check status
pg_isready
```

### "Prisma Client not found"

**Solution**: Generate the client:
```bash
npx prisma generate
```

### "Port 3000 already in use"

**Solution**: Kill the process or use a different port:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
PORT=3001 npm run dev
```

## Next Steps

1. **Read the documentation**:
   - [README.md](README.md) - Full documentation
   - [EXPLANATION.md](EXPLANATION.md) - Technical deep dive
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to production

2. **Explore the code**:
   - Start with [app/page.tsx](app/page.tsx) - Dashboard UI
   - Then [app/api/links/route.ts](app/api/links/route.ts) - API logic
   - Finally [app/[code]/route.ts](app/[code]/route.ts) - Redirect logic

3. **Deploy to Vercel**:
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions

## Useful Commands

```bash
# Development
npm run dev           # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open database GUI
npx prisma migrate dev --name <name>  # Create migration
npx prisma generate  # Generate Prisma Client

# Code Quality
npm run lint         # Run ESLint
```

## Project Structure

```
tinylink/
├── app/
│   ├── page.tsx           # Dashboard
│   ├── [code]/route.ts    # Redirect handler
│   ├── code/[code]/page.tsx  # Stats page
│   └── api/links/         # API routes
├── lib/
│   └── prisma.ts          # Prisma client
├── prisma/
│   └── schema.prisma      # Database schema
└── .env                   # Environment variables
```

## Support

If you run into issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the full [README.md](README.md)
3. Check [EXPLANATION.md](EXPLANATION.md) for technical details

---

**Happy coding! 🚀**
