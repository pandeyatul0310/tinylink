# TinyLink - System Architecture

Visual guide to understanding how TinyLink works.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                        │
│  (Chrome, Firefox, Safari, etc.)                           │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             │ HTTP Requests                  │ View Pages
             ↓                                ↓
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Server                         │
│                    (Vercel Serverless)                      │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │   Frontend (UI)  │         │   Backend (API)  │        │
│  │                  │         │                  │        │
│  │  • Dashboard     │         │  • POST /api/    │        │
│  │  • Stats Page    │         │  • GET /api/     │        │
│  │  • React State   │         │  • DELETE /api/  │        │
│  │  • Tailwind CSS  │         │  • GET /:code    │        │
│  └──────────────────┘         └─────────┬────────┘        │
│                                          │                 │
└──────────────────────────────────────────┼─────────────────┘
                                           │
                                           │ Prisma ORM
                                           │ (SQL Queries)
                                           ↓
                               ┌───────────────────────┐
                               │   PostgreSQL DB       │
                               │   (Neon / Local)      │
                               │                       │
                               │  ┌─────────────────┐ │
                               │  │  Link Table     │ │
                               │  │  • code         │ │
                               │  │  • targetUrl    │ │
                               │  │  • clicks       │ │
                               │  │  • lastClicked  │ │
                               │  └─────────────────┘ │
                               └───────────────────────┘
```

## 🔄 Request Flow Diagrams

### 1. Creating a Short Link

```
User                Dashboard             API Route            Database
 │                     │                     │                    │
 │  Fill form         │                     │                    │
 │  Click Submit      │                     │                    │
 ├───────────────────>│                     │                    │
 │                    │  POST /api/links    │                    │
 │                    │  {targetUrl, code}  │                    │
 │                    ├────────────────────>│                    │
 │                    │                     │  Validate URL      │
 │                    │                     │  Validate code     │
 │                    │                     │  Check uniqueness  │
 │                    │                     ├───────────────────>│
 │                    │                     │  SELECT WHERE      │
 │                    │                     │  code = 'abc'      │
 │                    │                     │<───────────────────┤
 │                    │                     │  (not found)       │
 │                    │                     │                    │
 │                    │                     │  Create link       │
 │                    │                     ├───────────────────>│
 │                    │                     │  INSERT INTO Link  │
 │                    │                     │<───────────────────┤
 │                    │                     │  (success)         │
 │                    │  201 Created        │                    │
 │                    │<────────────────────┤                    │
 │                    │  {id, code, ...}    │                    │
 │  Success message   │                     │                    │
 │<───────────────────┤                     │                    │
 │  "Link created!"   │                     │                    │
```

### 2. Using a Short Link (Redirect)

```
User               Redirect Handler          Database
 │                       │                      │
 │  Visit /abc123        │                      │
 ├──────────────────────>│                      │
 │                       │  Find link           │
 │                       ├─────────────────────>│
 │                       │  SELECT * WHERE      │
 │                       │  code = 'abc123'     │
 │                       │<─────────────────────┤
 │                       │  {targetUrl: '...'}  │
 │                       │                      │
 │                       │  Update stats        │
 │                       ├─────────────────────>│
 │                       │  UPDATE Link SET     │
 │                       │  clicks = clicks + 1 │
 │                       │<─────────────────────┤
 │                       │  (success)           │
 │  302 Redirect         │                      │
 │  Location: target     │                      │
 │<──────────────────────┤                      │
 │                       │                      │
 │  Navigate to target   │                      │
```

### 3. Viewing Statistics

```
User              Stats Page           API Route           Database
 │                    │                    │                   │
 │  Click "abc123"    │                    │                   │
 ├───────────────────>│                    │                   │
 │                    │  Navigate to       │                   │
 │                    │  /code/abc123      │                   │
 │                    │                    │                   │
 │                    │  GET /api/links/   │                   │
 │                    │  abc123            │                   │
 │                    ├───────────────────>│                   │
 │                    │                    │  Fetch link       │
 │                    │                    ├──────────────────>│
 │                    │                    │  SELECT * WHERE   │
 │                    │                    │  code = 'abc123'  │
 │                    │                    │<──────────────────┤
 │                    │                    │  {code, clicks,   │
 │                    │                    │   lastClicked...} │
 │                    │  200 OK            │                   │
 │                    │<───────────────────┤                   │
 │                    │  {link data}       │                   │
 │  Display stats     │                    │                   │
 │<───────────────────┤                    │                   │
 │  • Total clicks    │                    │                   │
 │  • Last clicked    │                    │                   │
```

## 📦 Component Architecture

### Frontend Component Tree

```
RootLayout (app/layout.tsx)
│
├── Header
│   ├── Title: "TinyLink"
│   └── Subtitle: "URL Shortener Service"
│
├── Main Content (children)
│   │
│   ├── Dashboard (app/page.tsx)
│   │   ├── CreateLinkForm
│   │   │   ├── TargetURL Input
│   │   │   ├── CustomCode Input
│   │   │   └── Submit Button
│   │   │
│   │   └── LinksTable
│   │       ├── SearchBar
│   │       └── LinkRows
│   │           ├── Code (clickable → Stats)
│   │           ├── TargetURL
│   │           ├── Clicks
│   │           ├── LastClicked
│   │           └── Actions (Copy, Delete)
│   │
│   └── StatsPage (app/code/[code]/page.tsx)
│       ├── BackButton
│       └── StatsDisplay
│           ├── ShortCode + CopyButton
│           ├── TargetURL (clickable)
│           ├── StatCards
│           │   ├── TotalClicks
│           │   ├── LastClicked
│           │   ├── CreatedDate
│           │   └── UpdatedDate
│           └── Actions (Test, Delete)
│
└── Footer
    └── Copyright
```

### Backend Route Structure

```
app/
│
├── api/
│   └── links/
│       ├── route.ts                    # POST, GET /api/links
│       │   ├── POST: Create link
│       │   │   ├── Validate URL
│       │   │   ├── Validate code
│       │   │   ├── Check uniqueness
│       │   │   └── Insert into DB
│       │   │
│       │   └── GET: List all links
│       │       └── SELECT * ORDER BY created
│       │
│       └── [code]/
│           └── route.ts                # GET, DELETE /api/links/:code
│               ├── GET: Fetch one link
│               │   └── SELECT WHERE code = :code
│               │
│               └── DELETE: Remove link
│                   └── DELETE WHERE code = :code
│
├── [code]/
│   └── route.ts                        # GET /:code (redirect)
│       ├── Find link by code
│       ├── Update clicks atomically
│       └── Return 302 redirect
│
├── code/
│   └── [code]/
│       └── page.tsx                    # Stats page UI
│           └── Fetch and display stats
│
└── healthz/
    └── route.ts                        # Health check
        └── Return {ok: true, uptime}
```

## 🗄️ Database Schema

### Link Table Structure

```
┌────────────────────────────────────────────────────────┐
│                      Link Table                        │
├──────────┬──────────┬──────────────┬──────────────────┤
│  Column  │   Type   │ Constraints  │   Description    │
├──────────┼──────────┼──────────────┼──────────────────┤
│ id       │ String   │ PRIMARY KEY  │ Unique ID (CUID) │
│ code     │ String   │ UNIQUE       │ Short code       │
│ targetUrl│ String   │ NOT NULL     │ Long URL         │
│ clicks   │ Int      │ DEFAULT 0    │ Click counter    │
│lastClicked│DateTime │ NULLABLE     │ Last access time │
│createdAt │ DateTime │ DEFAULT now()│ Creation time    │
│updatedAt │ DateTime │ AUTO UPDATE  │ Last update time │
└──────────┴──────────┴──────────────┴──────────────────┘

Indexes:
  • PRIMARY KEY on id
  • UNIQUE INDEX on code
  • REGULAR INDEX on code (for fast lookups)
```

### Example Data

```
id: 'clx123abc...'
code: 'github'
targetUrl: 'https://github.com/example/repo'
clicks: 42
lastClicked: 2024-01-15T10:30:00.000Z
createdAt: 2024-01-01T00:00:00.000Z
updatedAt: 2024-01-15T10:30:00.000Z
```

## 🔐 Security Architecture

### Input Validation Flow

```
User Input (Untrusted)
       │
       ↓
┌──────────────────┐
│ Frontend         │
│ Validation       │  HTML5 pattern, required attributes
│ (First Line)     │  Quick feedback, better UX
└────────┬─────────┘
         │ Can be bypassed (user can modify frontend)
         ↓
┌──────────────────┐
│ Backend          │
│ Validation       │  CRITICAL - Cannot be bypassed
│ (Must Have)      │
├──────────────────┤
│ • URL Format     │  new URL() throws on invalid
│ • Code Format    │  Regex: [A-Za-z0-9]{6,8}
│ • Code Length    │  6-8 characters only
│ • Uniqueness     │  Database constraint + check
└────────┬─────────┘
         │ All checks passed
         ↓
┌──────────────────┐
│ Prisma ORM       │  Parameterized queries
│ (SQL Safety)     │  Prevents SQL injection
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ PostgreSQL       │  ACID transactions
│ (Data Safety)    │  Atomic operations
└──────────────────┘
```

## ⚡ Concurrency Handling

### Atomic Increment Mechanism

**Scenario**: Two users click the same link simultaneously

```
Time    Request A              Database            Request B
────────────────────────────────────────────────────────────
t0      GET link (clicks=10)
t1                             Lock row
t2      Read: clicks=10
t3                                                GET link (waits)
t4      UPDATE clicks=11
t5                             Commit, unlock
t6                             Lock row           Read: clicks=11
t7                                                UPDATE clicks=12
t8                             Commit, unlock
────────────────────────────────────────────────────────────
Result: clicks=12 ✅ (correct)
```

**With Non-Atomic Operation** (BAD):

```
Time    Request A              Database            Request B
────────────────────────────────────────────────────────────
t0      GET link (clicks=10)
t1                                                GET link (clicks=10)
t2      Calculate: 10+1=11
t3                                                Calculate: 10+1=11
t4      UPDATE clicks=11
t5                                                UPDATE clicks=11
────────────────────────────────────────────────────────────
Result: clicks=11 ❌ (lost one click!)
```

**Prisma Atomic Increment**:

```typescript
// ✅ Atomic - Safe for concurrency
await prisma.link.update({
  where: { code },
  data: { clicks: { increment: 1 } }
});

// Generates SQL:
// UPDATE "Link" SET clicks = clicks + 1 WHERE code = $1
```

## 🚀 Deployment Architecture

### Development (Local)

```
┌─────────────────────────────────────────┐
│  Your Computer (localhost)              │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  Next.js Dev Server            │    │
│  │  http://localhost:3000         │    │
│  │  • Hot reload                  │    │
│  │  • Source maps                 │    │
│  └────────────────────────────────┘    │
│              │                          │
│              ↓                          │
│  ┌────────────────────────────────┐    │
│  │  Local PostgreSQL              │    │
│  │  localhost:5432                │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Production (Vercel + Neon)

```
┌─────────────────────────────────────────────────────────┐
│                    Internet Users                       │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ↓
                    ┌──────────┐
                    │  Vercel  │
                    │   CDN    │  Global edge network
                    └─────┬────┘
                          │
         ┌────────────────┴────────────────┐
         ↓                                 ↓
┌────────────────────┐          ┌────────────────────┐
│  Serverless Func   │          │  Static Assets     │
│  (API Routes)      │          │  (JS, CSS, Images) │
│                    │          └────────────────────┘
│  • Auto-scaling    │
│  • Pay per request │
│  • Edge locations  │
└─────────┬──────────┘
          │
          │ Connection pooling
          ↓
┌─────────────────────┐
│  Neon PostgreSQL    │
│  (Managed DB)       │
│                     │
│  • Auto-pause       │
│  • Branching        │
│  • Backups          │
└─────────────────────┘
```

## 🔄 Data Flow Example: Complete User Journey

```
1. User opens tinylink.vercel.app
   │
   ├─> Vercel CDN serves static HTML/CSS/JS
   │
   ├─> Browser renders Dashboard component
   │
   └─> useEffect triggers: fetch('/api/links')
       │
       └─> Vercel serverless function executes
           │
           └─> Prisma queries Neon DB: SELECT * FROM Link
               │
               └─> Returns JSON array of links
                   │
                   └─> Dashboard renders table
                       │
                       USER SEES LINKS ✓

2. User fills form and clicks "Create"
   │
   └─> handleSubmit: POST /api/links {targetUrl, code}
       │
       ├─> Validate input (frontend)
       │
       ├─> Send to API (fetch)
       │
       └─> Serverless function:
           │
           ├─> Validate URL format
           ├─> Validate code format
           ├─> Check if code exists
           └─> Prisma: INSERT INTO Link
               │
               └─> Return 201 with new link
                   │
                   └─> Dashboard shows success message
                       │
                       └─> Refresh link list
                           │
                           USER SEES NEW LINK ✓

3. User shares link: tinylink.vercel.app/abc123
   │
   └─> Someone clicks it
       │
       └─> GET /abc123
           │
           └─> Serverless function (redirect handler):
               │
               ├─> Prisma: SELECT WHERE code='abc123'
               ├─> Prisma: UPDATE clicks = clicks + 1
               └─> Return 302 redirect
                   │
                   BROWSER REDIRECTS ✓

4. User checks stats: clicks "abc123" in table
   │
   └─> Navigate to /code/abc123
       │
       ├─> Render StatsPage component
       │
       └─> useEffect: GET /api/links/abc123
           │
           └─> Serverless function: SELECT WHERE code='abc123'
               │
               └─> Return link with updated click count
                   │
                   USER SEES STATS ✓
```

## 🎯 Performance Characteristics

### Response Times (Typical)

```
Operation                 Latency    Why
────────────────────────────────────────────────
Health Check              ~50ms     No DB query
List Links                ~100ms    Simple SELECT
Create Link               ~150ms    INSERT + validation
Get Link Stats            ~100ms    Simple SELECT
Redirect (/:code)         ~120ms    SELECT + UPDATE
Delete Link               ~100ms    Simple DELETE
────────────────────────────────────────────────
Static Assets (CDN)       ~20ms     Edge cache
Database Query (Neon)     ~30ms     Connection pool
Serverless Cold Start     ~500ms    First request only
Serverless Warm           ~50ms     Subsequent requests
```

### Scalability Limits

```
Resource              Free Tier Limit     Mitigation
────────────────────────────────────────────────────────────
Vercel Bandwidth      100 GB/month       Upgrade to Pro
Neon Storage          10 GB              Archive old links
Neon Connections      100 concurrent     Connection pooling
Serverless Exec Time  10s timeout        Optimize queries
Database CPU          Shared             Dedicated instance
```

## 🧠 Key Design Decisions

### Why Next.js App Router?

```
Pros:
  ✓ Single codebase (UI + API)
  ✓ File-based routing (intuitive)
  ✓ Serverless ready (no server management)
  ✓ TypeScript native
  ✓ Vercel optimization

Cons:
  ✗ Learning curve (React Server Components)
  ✗ Less control vs Express
```

### Why 302 (Temporary) Redirect?

```
302 (Temporary):
  ✓ Browser doesn't cache
  ✓ Every visit hits our server
  ✓ Can track every click
  ✗ Slightly slower (network hop)

301 (Permanent):
  ✓ Faster (browser caches)
  ✗ Can't track clicks after first visit
  ✗ Hard to change destination
```

### Why Atomic Increment?

```
Atomic ({ increment: 1 }):
  ✓ Thread-safe
  ✓ No lost updates
  ✓ Handles concurrency
  ✗ Database-dependent feature

Read-Modify-Write (link.clicks + 1):
  ✓ Simple to understand
  ✗ Race conditions
  ✗ Lost updates
  ✗ Wrong counts
```

## 📊 Monitoring Points

```
What to Monitor              Metric                    Alert If
─────────────────────────────────────────────────────────────────
API Health                   /healthz response         Not 200
Error Rate                   5xx responses             >1%
Response Time                p95 latency               >500ms
Database Connections         Active connections        >80
Redirect Success Rate        302 vs 404                404 >5%
Link Creation Success        201 vs 409/400            400+409 >10%
```

---

This architecture supports:
- ✅ Thousands of requests per hour
- ✅ Automatic scaling
- ✅ High availability
- ✅ Data consistency
- ✅ Security best practices

Ready for production! 🚀
