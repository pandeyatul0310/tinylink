# TinyLink - Technical Explanation & Understanding Guide

This document will help you understand every aspect of the TinyLink application so you can confidently explain it in your interview.

## 🎯 High-Level Overview

TinyLink is a **full-stack web application** that:
1. Takes long URLs and creates short, memorable codes
2. Redirects users who visit the short URL to the original long URL
3. Tracks how many times each link is clicked
4. Provides a dashboard to manage all links

**Think of it like this**: Just like bit.ly, when you visit `bit.ly/abc123`, it redirects you to a long URL. We built the same thing!

## 🏗️ Architecture

### Technology Stack (Why We Chose Each)

1. **Next.js 15** (Framework)
   - **What**: React framework with both frontend and backend
   - **Why**: Single codebase for UI and API routes, easy deployment to Vercel
   - **Alternative**: Express.js (backend only) + React (frontend) = more complexity

2. **TypeScript** (Language)
   - **What**: JavaScript with type checking
   - **Why**: Catches errors before runtime, better IDE autocomplete
   - **Example**:
     ```typescript
     // TypeScript catches this error:
     const link: Link = { code: "abc", clicks: "five" }; // Error: clicks should be number
     ```

3. **Tailwind CSS** (Styling)
   - **What**: Utility-first CSS framework
   - **Why**: Fast styling with classes like `bg-blue-600 text-white p-4`
   - **Alternative**: Plain CSS or styled-components (more code)

4. **PostgreSQL** (Database)
   - **What**: Relational database
   - **Why**: ACID compliance, handles concurrent updates safely
   - **Example**: When two users click a link simultaneously, PostgreSQL ensures both clicks count

5. **Prisma** (ORM)
   - **What**: Database toolkit that generates type-safe queries
   - **Why**: No SQL injection risks, type-safe queries, automatic migrations
   - **Example**:
     ```typescript
     // Prisma (type-safe):
     const link = await prisma.link.findUnique({ where: { code: "abc" } });

     // Raw SQL (prone to SQL injection):
     const link = await db.query(`SELECT * FROM links WHERE code = '${userInput}'`);
     ```

## 📂 File-by-File Explanation

### Configuration Files

#### `package.json`
```json
{
  "scripts": {
    "dev": "next dev",           // Starts development server
    "build": "next build",       // Builds for production
    "start": "next start"        // Starts production server
  }
}
```

**Interview Question**: "What does `npm run build` do?"
**Answer**: "It compiles the TypeScript code, bundles JavaScript, optimizes images, and creates a production-ready build in the `.next` folder."

#### `tsconfig.json`
- Configures TypeScript compiler
- Sets module resolution, JSX handling, and path aliases
- **Key setting**: `"paths": { "@/*": ["./*"] }` lets us write `import { prisma } from '@/lib/prisma'` instead of `../../lib/prisma`

#### `tailwind.config.ts`
- Tells Tailwind which files to scan for classes
- Configures custom colors and themes
- **Key**: `content: ["./app/**/*.{js,ts,jsx,tsx}"]` scans all files in `app/` folder

### Database Layer

#### `prisma/schema.prisma`

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

**Interview Explanation**:

- **`@id @default(cuid())`**:
  - Primary key, auto-generated unique ID
  - CUID = Collision-resistant Unique ID (better than auto-increment for distributed systems)

- **`@unique`**:
  - Database constraint ensuring no duplicate codes
  - Returns error if we try to insert duplicate

- **`@@index([code])`**:
  - Creates database index on `code` column
  - **Why**: Makes lookups during redirects extremely fast (O(log n) instead of O(n))
  - **Example**: Finding one code in 1 million links takes ~20 comparisons instead of 1 million

- **`clicks Int @default(0)`**:
  - Integer counter starting at 0
  - **Why Int not String**: Can use `{ increment: 1 }` (atomic operation)

- **`lastClicked DateTime?`**:
  - **`?` means nullable**: First time, value is `null`
  - Updates each time someone clicks

**Interview Question**: "Why use an index on the code field?"
**Answer**: "The redirect endpoint is called frequently, and without an index, Postgres would scan every row. An index creates a B-tree structure for O(log n) lookups, making redirects instant even with millions of links."

#### `lib/prisma.ts`

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma;
```

**What's Happening Here?**

1. **In Production**: Creates one Prisma Client instance, reused across all requests
2. **In Development**: Stores instance in `global` object to survive hot reloads
3. **Problem it solves**: Without this, every hot reload creates a new connection, exhausting database connection pool

**Interview Question**: "Why do we need a Prisma singleton?"
**Answer**: "In development, Next.js hot reloads the code on every change. Each reload would create a new database connection, quickly exhausting the connection pool (typically limited to 10-100). By storing the client in the global object, we reuse the same connection across reloads."

### API Layer

#### `app/api/links/route.ts` (POST & GET)

**POST /api/links** - Create Link

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { targetUrl, code: customCode } = body;

  // 1. Validate URL
  if (!isValidUrl(targetUrl)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // 2. Validate or generate code
  if (customCode) {
    if (!isValidCode(customCode)) { /* ... */ }

    const exists = await prisma.link.findUnique({ where: { code: customCode } });
    if (exists) {
      return NextResponse.json({ error: 'Code taken' }, { status: 409 });
    }
  } else {
    // Generate random code
    code = generateRandomCode();
  }

  // 3. Create link
  const link = await prisma.link.create({
    data: { code, targetUrl }
  });

  return NextResponse.json(link, { status: 201 });
}
```

**Key Concepts**:

1. **Validation First**: Never trust user input
   - `isValidUrl()` uses `new URL()` which throws on invalid URLs
   - `isValidCode()` uses regex: `/^[A-Za-z0-9]{6,8}$/`

2. **409 Conflict**: Standard HTTP code for "resource already exists"

3. **Why generate random codes?**:
   - User convenience (don't have to think of codes)
   - We try up to 10 times to find unique code
   - With 6 alphanumeric chars: 62^6 = 56 billion possibilities (collision unlikely)

**GET /api/links** - List All Links

```typescript
export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(links);
}
```

**Why `orderBy: { createdAt: 'desc' }`?**
- Shows newest links first (better UX)

#### `app/api/links/[code]/route.ts` (GET & DELETE)

**Dynamic Route**: `[code]` is a parameter

**GET /api/links/:code** - Get Single Link

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(link);
}
```

**Interview Question**: "Why do we await params?"
**Answer**: "In Next.js 15, params is now a Promise due to partial prerendering optimizations. We need to await it to access the actual values."

**DELETE /api/links/:code** - Delete Link

```typescript
export async function DELETE(request: NextRequest, { params }) {
  const { code } = await params;

  await prisma.link.delete({ where: { code } });

  return NextResponse.json({ message: 'Deleted' });
}
```

**Note**: Prisma automatically throws if link doesn't exist, which is caught by our try-catch.

#### `app/healthz/route.ts` - Health Check

```typescript
const startTime = Date.now();

export async function GET() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  return NextResponse.json({
    ok: true,
    version: '1.0',
    uptime: `${uptime} seconds`
  }, { status: 200 });
}
```

**Purpose**:
- Automated tests can verify the app is running
- Load balancers can check if instance is healthy
- Monitoring systems can track uptime

**Why track `startTime`?**
- Module-level variable initialized once when server starts
- Survives across requests
- Simple way to track uptime

### Redirect Logic

#### `app/[code]/route.ts` - The Core Feature

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // 1. Find link
  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 2. Update stats atomically
  await prisma.link.update({
    where: { code },
    data: {
      clicks: { increment: 1 },
      lastClicked: new Date()
    }
  });

  // 3. Redirect (302)
  return NextResponse.redirect(link.targetUrl, { status: 302 });
}
```

**Critical Concepts**:

1. **Atomic Increment**:
   ```typescript
   clicks: { increment: 1 }  // ✅ Safe (atomic)
   clicks: link.clicks + 1   // ❌ Unsafe (race condition)
   ```

   **Why atomic matters**:
   - Imagine 2 users click simultaneously when clicks = 10
   - Without atomic: Both read 10, both write 11 → clicks = 11 (lost update!)
   - With atomic: Database handles concurrency → clicks = 12 ✅

2. **302 vs 301 Redirect**:
   - **302 (Temporary)**: Browser doesn't cache, hits our server every time
   - **301 (Permanent)**: Browser caches, stops tracking clicks
   - **We use 302** to ensure every click is tracked

3. **Order Matters**:
   - Update stats BEFORE redirect (if redirect fails, stats still update)
   - Alternative: Update stats in background (more complex, can lose data)

**Interview Question**: "What happens if the database update fails but the redirect succeeds?"
**Answer**: "With our current implementation, if the update fails, the error is caught and we return a 500 error instead of redirecting. This is safer than losing click data. In production, we could use a background job queue to retry failed updates."

### Frontend (UI)

#### `app/layout.tsx` - Root Layout

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>...</header>
        <main>{children}</main>
        <footer>...</footer>
      </body>
    </html>
  );
}
```

**Purpose**:
- Wraps all pages with header/footer
- Imports global CSS
- Sets metadata (title, description)

**Interview Question**: "Why use a layout instead of repeating header/footer on each page?"
**Answer**: "Layouts prevent code duplication and ensure consistency. In Next.js, layouts also persist across navigation, avoiding unnecessary re-renders of the header and footer."

#### `app/page.tsx` - Dashboard

**Key React Concepts**:

1. **State Management**:
   ```typescript
   const [links, setLinks] = useState<Link[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   ```
   - Each piece of data that changes over time is "state"
   - `useState` hook creates state variable + setter function
   - Changing state triggers re-render

2. **Effects**:
   ```typescript
   useEffect(() => {
     fetchLinks();
   }, []);  // Empty array = run once on mount
   ```
   - Side effects (API calls, subscriptions)
   - `[]` dependency array: run once when component mounts
   - `[searchQuery]`: run whenever `searchQuery` changes

3. **Event Handlers**:
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();  // Prevent page reload
     // ... make API call
   };
   ```
   - `e.preventDefault()`: Stop default form submission (which would reload page)
   - We want to handle submission with JavaScript (SPA behavior)

4. **Conditional Rendering**:
   ```typescript
   {loading && <div>Loading...</div>}
   {error && <div>Error: {error}</div>}
   {!loading && !error && links.map(...)}
   ```
   - Show different UI based on state
   - `&&` operator: if left is true, show right

**Data Flow**:
1. Component mounts → `useEffect` runs → `fetchLinks()` called
2. `fetchLinks()` → `fetch('/api/links')` → sets `links` state
3. State update → React re-renders → table shows links
4. User submits form → `handleSubmit()` → `POST /api/links` → `fetchLinks()` again → table updates

#### `app/code/[code]/page.tsx` - Stats Page

**Key Difference from Dashboard**:
```typescript
export default function StatsPage({
  params
}: {
  params: Promise<{ code: string }>
}) {
  const resolvedParams = use(params);  // New React 19 hook

  useEffect(() => {
    fetch(`/api/links/${resolvedParams.code}`);
  }, [resolvedParams.code]);
}
```

**`use()` Hook**:
- React 19 feature for unwrapping Promises in components
- Suspends component until Promise resolves
- Alternative: `const params = await params` (in async component)

## 🔄 Complete User Flow Examples

### Example 1: Creating a Link

**User Actions**:
1. User opens `http://localhost:3000`
2. Fills in: URL = `https://github.com/example`, Code = `gh`
3. Clicks "Create Short Link"

**What Happens Technically**:

```
Frontend (page.tsx)
  ↓
handleSubmit()
  ↓
fetch('/api/links', { method: 'POST', body: { targetUrl, code } })
  ↓
Backend (app/api/links/route.ts)
  ↓
Validate URL ✅
  ↓
Validate code format ✅
  ↓
Check database: "SELECT * FROM Link WHERE code = 'gh'"
  ↓
Not found ✅
  ↓
Insert: "INSERT INTO Link (code, targetUrl) VALUES ('gh', '...')"
  ↓
Return JSON: { id, code: 'gh', targetUrl: '...', clicks: 0, ... }
  ↓
Frontend receives response
  ↓
setSuccessMessage("Link created!")
  ↓
fetchLinks() → Refresh table
  ↓
User sees new link in table
```

### Example 2: Using a Short Link

**User Actions**:
1. User visits `http://localhost:3000/gh`

**What Happens Technically**:

```
Browser: GET /gh
  ↓
Next.js Router: Match route app/[code]/route.ts
  ↓
Execute GET handler with params = { code: 'gh' }
  ↓
Database: "SELECT * FROM Link WHERE code = 'gh'"
  ↓
Found: { code: 'gh', targetUrl: 'https://github.com/example', clicks: 5, ... }
  ↓
Database: "UPDATE Link SET clicks = clicks + 1, lastClicked = NOW() WHERE code = 'gh'"
  ↓
Return: NextResponse.redirect('https://github.com/example', { status: 302 })
  ↓
Browser receives: HTTP 302 Location: https://github.com/example
  ↓
Browser automatically navigates to https://github.com/example
```

**Network Tab in DevTools**:
```
Request: GET /gh
Status: 302 Found
Response Headers:
  Location: https://github.com/example
```

## 🔐 Security Considerations

### 1. URL Validation

```typescript
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
```

**What It Prevents**:
- Storing invalid URLs that would break redirects
- JavaScript injection: `javascript:alert('XSS')`

**Interview Question**: "What if user submits `javascript:alert('XSS')` as URL?"
**Answer**: "`new URL()` would accept it (it's technically a valid URL scheme), but we could add additional validation to only allow `http://` and `https://` schemes:
```typescript
const url = new URL(string);
return url.protocol === 'http:' || url.protocol === 'https:';
```

### 2. Code Format Validation

```typescript
function isValidCode(code: string): boolean {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}
```

**What It Prevents**:
- SQL Injection: `'; DROP TABLE Links; --`
- XSS: `<script>alert('XSS')</script>`
- Path traversal: `../../etc/passwd`

**Why It Works**:
- Only allows safe characters
- Fixed length (6-8) prevents extremely long codes

### 3. SQL Injection Prevention (Prisma)

**Unsafe (Raw SQL)**:
```typescript
// ❌ NEVER DO THIS
const code = req.body.code;
const result = await db.query(`SELECT * FROM Link WHERE code = '${code}'`);
```

If `code = "' OR '1'='1"`, query becomes:
```sql
SELECT * FROM Link WHERE code = '' OR '1'='1'  -- Returns all links!
```

**Safe (Prisma)**:
```typescript
// ✅ Prisma parameterizes automatically
await prisma.link.findUnique({ where: { code } });
```

Prisma generates:
```sql
SELECT * FROM Link WHERE code = $1  -- $1 = safely escaped parameter
```

## 🎯 Common Interview Questions

### Q: "Why Next.js instead of separate frontend/backend?"

**Answer**:
"Next.js provides several advantages:
1. **Single Deployment**: One codebase, one deployment (frontend + API routes)
2. **Shared Types**: TypeScript types shared between frontend and backend
3. **Optimized Performance**: Server-side rendering, automatic code splitting
4. **Developer Experience**: Hot reload for both frontend and backend changes
5. **Simplified Routing**: File-based routing for both pages and API

Alternative would be Express backend + React frontend, requiring two separate projects, two deployments, and separate type definitions."

### Q: "How do you handle concurrent clicks on the same link?"

**Answer**:
"PostgreSQL handles this with ACID transactions. When we use Prisma's `{ increment: 1 }`, it translates to:
```sql
UPDATE Link SET clicks = clicks + 1 WHERE code = $1
```

PostgreSQL locks the row during the update. If two requests arrive simultaneously:
1. Request A acquires lock, reads clicks=10, sets to 11, releases lock
2. Request B waits for lock, reads clicks=11, sets to 12, releases lock

Result: clicks=12 (correct). Without atomic increment, both might read 10 and both write 11 (losing one click)."

### Q: "What happens if the database goes down?"

**Answer**:
"Current implementation:
1. Health check still returns 200 (doesn't check database)
2. All API endpoints would return 500 errors
3. Redirects would fail

**Improvements for production**:
1. Add database ping to health check:
   ```typescript
   await prisma.$queryRaw`SELECT 1`;
   ```
2. Implement retry logic with exponential backoff
3. Add circuit breaker pattern
4. Cache popular links in Redis/Memory for resilience"

### Q: "How would you add authentication?"

**Answer**:
"I would:
1. **Add Auth Provider** (e.g., NextAuth.js with GitHub OAuth)
2. **Update Schema**:
   ```prisma
   model User {
     id    String @id @default(cuid())
     email String @unique
     links Link[]
   }

   model Link {
     userId String
     user   User   @relation(fields: [userId], references: [id])
   }
   ```
3. **Protect API Routes**:
   ```typescript
   const session = await getServerSession();
   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   ```
4. **Filter Links by User**:
   ```typescript
   const links = await prisma.link.findMany({
     where: { userId: session.user.id }
   });
   ```"

### Q: "How would you handle 1 million requests per day?"

**Answer**:
"Current architecture can handle moderate load, but for 1M requests/day:

**Immediate optimizations**:
1. **Database Connection Pooling**: Configure Prisma connection pool size
2. **Caching**: Add Redis for popular links
   ```typescript
   const cached = await redis.get(code);
   if (cached) return redirect(cached);
   ```
3. **CDN**: Serve static assets via Vercel CDN

**Scaling strategy**:
1. **Database**:
   - Upgrade to dedicated Postgres instance
   - Add read replicas for GET requests
   - Partition Link table by code prefix

2. **Application**:
   - Serverless scales automatically on Vercel
   - Each request runs in isolated function

3. **Monitoring**:
   - Add application performance monitoring (APM)
   - Track slow queries, error rates
   - Set up alerts for anomalies

**Cost estimation**: Vercel's Pro plan supports this scale (~$20/month + database costs)."

## 📊 Testing Your Knowledge

Before your interview, ensure you can answer:

1. ✅ Explain the complete flow from clicking a short link to being redirected
2. ✅ Why do we use `{ increment: 1 }` instead of `clicks: link.clicks + 1`?
3. ✅ What's the difference between 301 and 302 redirects?
4. ✅ How does Prisma prevent SQL injection?
5. ✅ Why do we need the Prisma singleton pattern?
6. ✅ What does `@@index([code])` do and why is it important?
7. ✅ How does Next.js routing work with `[code]` folders?
8. ✅ Explain the purpose of `useEffect` and `useState`
9. ✅ What would you add to make this production-ready?
10. ✅ How would you debug if redirects stopped working?

## 🚀 Going Beyond

If asked "How would you improve this?", suggest:

1. **Analytics Dashboard**:
   - Chart of clicks over time
   - Geographic distribution
   - Referrer tracking

2. **Rate Limiting**:
   - Prevent abuse (one user creating 1000 links)
   - Use Redis with sliding window counter

3. **Custom Domains**:
   - User can use their own domain (e.g., `short.mycompany.com`)

4. **QR Codes**:
   - Generate QR code for each short link

5. **Link Expiration**:
   - Add `expiresAt` field
   - Automatic cleanup of old links

6. **A/B Testing**:
   - One code → multiple URLs (random selection)

---

**You now have a complete understanding of TinyLink! Practice explaining these concepts out loud, and you'll ace the interview. Good luck! 🎉**
