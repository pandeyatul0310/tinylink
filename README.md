# TinyLink - URL Shortener

A modern URL shortening service built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL. This application allows users to create short URLs, track click statistics, and manage their links through a clean, responsive interface.

## 🚀 Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Codes**: Optional custom short codes (6-8 alphanumeric characters)
- **Auto-generation**: Automatic code generation if no custom code is provided
- **Click Tracking**: Track total clicks and last clicked timestamp for each link
- **Statistics Dashboard**: View detailed stats for individual links
- **Search & Filter**: Search links by code or target URL
- **Responsive UI**: Mobile-friendly interface with Tailwind CSS
- **Health Check**: Built-in health check endpoint for monitoring

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: [Vercel](https://vercel.com/) (recommended)
- **Database Hosting**: [Neon](https://neon.tech/) (recommended)

## ✅ Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (local or cloud-hosted)
- Git

## 📦 Installation

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd tinylink
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and add your database connection string:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 🗄 Database Setup

### Local PostgreSQL

1. **Install PostgreSQL** (if not already installed)
2. **Create a database**:
```bash
createdb tinylink
```

3. **Run Prisma migrations**:
```bash
npx prisma migrate dev --name init
```

4. **Generate Prisma Client**:
```bash
npx prisma generate
```

### Using Neon (Cloud PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in `.env`
5. Run migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

## 🏃 Running Locally

1. **Start the development server**:
```bash
npm run dev
```

2. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

3. **Test the health check**:
```bash
curl http://localhost:3000/healthz
```

## 🌐 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**:
   - Add `DATABASE_URL` (from Neon or your database provider)
   - Add `NEXT_PUBLIC_BASE_URL` (your Vercel deployment URL)

4. **Deploy**:
   - Vercel will automatically build and deploy
   - Run migrations on deployment or manually:
   ```bash
   npx prisma migrate deploy
   ```

### Other Platforms (Render, Railway)

Similar process - configure environment variables and ensure the database is accessible.

## 📡 API Documentation

### Health Check

**GET** `/healthz`

Returns system health status.

**Response (200)**:
```json
{
  "ok": true,
  "version": "1.0",
  "uptime": "123 seconds",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Create Link

**POST** `/api/links`

Creates a new short link.

**Request Body**:
```json
{
  "targetUrl": "https://example.com/very/long/url",
  "code": "mycode" // Optional, 6-8 alphanumeric characters
}
```

**Response (201)**:
```json
{
  "id": "clx123...",
  "code": "mycode",
  "targetUrl": "https://example.com/very/long/url",
  "clicks": 0,
  "lastClicked": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400`: Invalid URL or code format
- `409`: Short code already exists

### List All Links

**GET** `/api/links`

Returns all links.

**Response (200)**:
```json
[
  {
    "id": "clx123...",
    "code": "abc123",
    "targetUrl": "https://example.com",
    "clicks": 42,
    "lastClicked": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Link Stats

**GET** `/api/links/:code`

Returns statistics for a specific link.

**Response (200)**:
```json
{
  "id": "clx123...",
  "code": "abc123",
  "targetUrl": "https://example.com",
  "clicks": 42,
  "lastClicked": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response**:
- `404`: Link not found

### Delete Link

**DELETE** `/api/links/:code`

Deletes a link.

**Response (200)**:
```json
{
  "message": "Link deleted successfully"
}
```

**Error Response**:
- `404`: Link not found

### Redirect

**GET** `/:code`

Redirects to the target URL and increments click count.

**Response**:
- `302`: Redirect to target URL
- `404`: Link not found

## 📁 Project Structure

```
tinylink/
├── app/
│   ├── [code]/              # Dynamic route for redirects
│   │   └── route.ts         # Redirect handler
│   ├── api/
│   │   └── links/           # API routes
│   │       ├── route.ts     # POST (create), GET (list all)
│   │       └── [code]/
│   │           └── route.ts # GET (stats), DELETE
│   ├── code/
│   │   └── [code]/
│   │       └── page.tsx     # Stats page UI
│   ├── healthz/
│   │   └── route.ts         # Health check endpoint
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Dashboard (home page)
├── lib/
│   └── prisma.ts            # Prisma client singleton
├── prisma/
│   └── schema.prisma        # Database schema
├── .env                     # Environment variables (gitignored)
├── .env.example             # Example environment variables
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## 🔍 How It Works

### Architecture Overview

This application follows a modern full-stack architecture:

1. **Frontend (React/Next.js)**:
   - Server-side rendering for initial page loads
   - Client-side navigation for subsequent interactions
   - React hooks for state management
   - Tailwind CSS for styling

2. **Backend (Next.js API Routes)**:
   - RESTful API endpoints
   - Server-side validation
   - Database operations via Prisma ORM

3. **Database (PostgreSQL)**:
   - Single `Link` table with indexes
   - Atomic operations for click tracking

### Key Components Explained

#### 1. Database Schema ([prisma/schema.prisma](prisma/schema.prisma))

```prisma
model Link {
  id          String   @id @default(cuid())
  code        String   @unique
  targetUrl   String
  clicks      Int      @default(0)
  lastClicked DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([code])
}
```

**Fields**:
- `id`: Unique identifier (CUID)
- `code`: Short code (6-8 alphanumeric, unique)
- `targetUrl`: Original long URL
- `clicks`: Number of times the link was accessed
- `lastClicked`: Timestamp of most recent click
- `createdAt`/`updatedAt`: Audit timestamps

**Why this design?**:
- `@unique` on `code` ensures no duplicates
- `@@index([code])` optimizes lookups during redirects
- `clicks` is incremented atomically to prevent race conditions

#### 2. Prisma Client Singleton ([lib/prisma.ts](lib/prisma.ts))

```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma;
```

**Why?**:
- In development, Next.js hot reloads create multiple instances
- This pattern reuses the same Prisma Client instance
- Prevents database connection exhaustion

#### 3. Create Link API ([app/api/links/route.ts](app/api/links/route.ts))

**Key Logic**:

1. **Validation**:
   - Checks if URL is valid using `new URL()`
   - Validates custom code format: `[A-Za-z0-9]{6,8}`

2. **Code Generation**:
   - If custom code provided: check uniqueness
   - If not: generate random code until unique one is found

3. **Database Insert**:
   - Create link with Prisma `create()`
   - Return 409 if code already exists

#### 4. Redirect Handler ([app/[code]/route.ts](app/[code]/route.ts))

**How it works**:

1. **Lookup**: Find link by code
2. **Update**: Increment clicks and set `lastClicked`
3. **Redirect**: Return 302 redirect to target URL
4. **Error Handling**: Return 404 if link doesn't exist

**Why 302 (Temporary Redirect)?**:
- Allows click tracking on each visit
- 301 (Permanent) would be cached by browsers

```typescript
await prisma.link.update({
  where: { code },
  data: {
    clicks: { increment: 1 },  // Atomic increment
    lastClicked: new Date(),
  },
});

return NextResponse.redirect(link.targetUrl, { status: 302 });
```

#### 5. Dashboard Page ([app/page.tsx](app/page.tsx))

**Features**:
- **Form**: Create new links with validation
- **Table**: Display all links with search/filter
- **Actions**: Copy short URL, delete link
- **State Management**: React hooks (`useState`, `useEffect`)

**User Experience**:
- Loading states (spinner while fetching)
- Error states (red alerts for errors)
- Success states (green confirmation)
- Empty states (helpful message when no links)

#### 6. Stats Page ([app/code/[code]/page.tsx](app/code/[code]/page.tsx))

**Details Shown**:
- Short code and full short URL
- Target URL (clickable)
- Total clicks
- Last clicked time
- Created/updated timestamps
- Actions: Test redirect, delete link

### Code Flow Examples

#### Creating a Short Link

1. User fills form on dashboard → submits
2. `POST /api/links` with `{ targetUrl, code? }`
3. Server validates URL format
4. If custom code: check database for uniqueness
5. If no custom code: generate random code
6. Insert into database with Prisma
7. Return created link (201) or error (400/409)
8. Dashboard refreshes link list

#### Using a Short Link

1. User visits `https://yourapp.com/abc123`
2. Next.js routes to `app/[code]/route.ts`
3. Lookup link in database by code
4. If found:
   - Increment click count atomically
   - Update `lastClicked` timestamp
   - Return 302 redirect to target URL
5. If not found: return 404

#### Viewing Statistics

1. User clicks code link on dashboard
2. Navigate to `/code/abc123`
3. Fetch link data via `GET /api/links/abc123`
4. Display statistics in formatted cards
5. Provide actions (test redirect, delete)

### Security Considerations

1. **URL Validation**: Prevents invalid URLs from being stored
2. **Code Format**: Restricts to alphanumeric (prevents injection)
3. **Atomic Operations**: Prevents race conditions in click counting
4. **Error Handling**: Doesn't leak sensitive information
5. **Client-Side Validation**: HTML5 patterns + JS validation

### Performance Optimizations

1. **Database Indexing**: Fast lookups on `code` field
2. **Prisma Connection Pooling**: Efficient database connections
3. **Next.js Caching**: Static optimization where possible
4. **Truncated URLs**: UI doesn't render extremely long URLs

## 🧪 Testing the Application

### Manual Testing Checklist

1. **Health Check**:
   ```bash
   curl http://localhost:3000/healthz
   # Should return: {"ok":true,"version":"1.0",...}
   ```

2. **Create Link (Auto Code)**:
   ```bash
   curl -X POST http://localhost:3000/api/links \
     -H "Content-Type: application/json" \
     -d '{"targetUrl":"https://google.com"}'
   # Should return 201 with generated code
   ```

3. **Create Link (Custom Code)**:
   ```bash
   curl -X POST http://localhost:3000/api/links \
     -H "Content-Type: application/json" \
     -d '{"targetUrl":"https://github.com","code":"github"}'
   # Should return 201
   ```

4. **Duplicate Code (409)**:
   ```bash
   curl -X POST http://localhost:3000/api/links \
     -H "Content-Type: application/json" \
     -d '{"targetUrl":"https://example.com","code":"github"}'
   # Should return 409 (code exists)
   ```

5. **List All Links**:
   ```bash
   curl http://localhost:3000/api/links
   # Should return array of all links
   ```

6. **Get Link Stats**:
   ```bash
   curl http://localhost:3000/api/links/github
   # Should return link details
   ```

7. **Redirect (302)**:
   ```bash
   curl -I http://localhost:3000/github
   # Should return HTTP 302 with Location header
   ```

8. **Delete Link**:
   ```bash
   curl -X DELETE http://localhost:3000/api/links/github
   # Should return 200
   ```

9. **404 After Delete**:
   ```bash
   curl -I http://localhost:3000/github
   # Should return HTTP 404
   ```

### UI Testing

1. Visit dashboard at `/`
2. Create a link without custom code
3. Create a link with custom code
4. Try to create duplicate code (should show error)
5. Search/filter links
6. Copy a short URL
7. Click on a code to view stats
8. Test redirect from stats page
9. Delete a link
10. Verify responsive design on mobile

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solutions**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify `DATABASE_URL` in `.env`
3. Check firewall/network settings
4. For Neon: ensure IP whitelist includes your IP

### Prisma Client Not Generated

**Error**: `@prisma/client did not initialize yet`

**Solution**:
```bash
npx prisma generate
```

### Build Errors

**Error**: TypeScript errors during build

**Solutions**:
1. Delete `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Regenerate Prisma: `npx prisma generate`

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_BASE_URL` | Base URL for short links | `https://yourapp.vercel.app` |

## 🎨 Customization

### Changing Code Length

Edit [app/api/links/route.ts](app/api/links/route.ts:16):

```typescript
function isValidCode(code: string): boolean {
  return /^[A-Za-z0-9]{4,10}$/.test(code); // 4-10 characters
}
```

### Adding Authentication

1. Install auth library (e.g., NextAuth.js)
2. Add `userId` field to `Link` model
3. Protect API routes with middleware
4. Filter links by user

### Custom Styling

Edit [app/globals.css](app/globals.css) or [tailwind.config.ts](tailwind.config.ts).

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## 🤝 Contributing

This is a take-home assignment project, but feel free to fork and extend it!

## 📄 License

MIT License - Feel free to use this project for learning and portfolio purposes.

## 🙋 Support

For questions or issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review API documentation
3. Check browser console for errors
4. Verify database connection

---

**Built with ❤️ using Next.js, TypeScript, and Prisma**
