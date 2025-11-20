# Prisma Integration Deep Dive - TinyLink

A complete, step-by-step guide explaining **exactly** how Prisma is integrated into the TinyLink project.

## 📚 Table of Contents

1. [Overview: What Prisma Does](#overview-what-prisma-does)
2. [Step-by-Step Integration](#step-by-step-integration)
3. [How Each File Works](#how-each-file-works)
4. [Understanding the Data Flow](#understanding-the-data-flow)
5. [Prisma in Action](#prisma-in-action)
6. [Advanced Concepts](#advanced-concepts)
7. [Common Questions](#common-questions)

---

## 🎯 Overview: What Prisma Does

### The Problem Prisma Solves

**Without Prisma**, you would write code like this:

```typescript
// ❌ Manual SQL - Error-prone, not type-safe
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

// SQL injection vulnerability!
const code = request.body.code;
const result = await client.query(
  `SELECT * FROM links WHERE code = '${code}'`
);

// No TypeScript types - 'result' is 'any'
const link = result.rows[0];
console.log(link.clicks); // ⚠️ No autocomplete, could have typo
```

**With Prisma**, you write:

```typescript
// ✅ Type-safe, secure, autocomplete
import { prisma } from '@/lib/prisma';

const code = request.body.code;
const link = await prisma.link.findUnique({
  where: { code }  // Automatically escaped, SQL injection impossible
});

// Full TypeScript support!
console.log(link.clicks); // ✓ Autocomplete works, type is 'number'
```

### What Prisma Provides

1. **Type Safety**: Full TypeScript integration
2. **Security**: Automatic SQL injection prevention
3. **Developer Experience**: Autocomplete, error checking
4. **Schema Management**: Database migrations
5. **Query Builder**: Intuitive API instead of SQL

---

## 🔧 Step-by-Step Integration

### Step 1: Install Prisma Packages

```bash
npm install @prisma/client    # Runtime dependency (used in code)
npm install -D prisma         # CLI tool (for development)
```

**What gets installed:**

- `@prisma/client` - The library you import in your code
- `prisma` - Command-line tool for migrations, schema management, etc.

**In package.json:**
```json
{
  "dependencies": {
    "@prisma/client": "^6.19.0"  // Used at runtime
  },
  "devDependencies": {
    "prisma": "^6.19.0"  // Used during development only
  }
}
```

### Step 2: Initialize Prisma

```bash
npx prisma init
```

**What this creates:**

1. **`prisma/schema.prisma`** - Database schema definition
2. **`.env`** - Environment variables (including DATABASE_URL)
3. **`prisma.config.ts`** - Prisma configuration (optional, newer versions)

**Files created:**

```
your-project/
├── prisma/
│   └── schema.prisma    ← Database schema
├── .env                 ← Environment variables
└── prisma.config.ts     ← Prisma config (optional)
```

### Step 3: Configure Database Connection

**Edit `.env`:**

```env
# This tells Prisma where your database is
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Example for local PostgreSQL:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tinylink?schema=public"

# Example for Neon (cloud):
DATABASE_URL="postgresql://user:pass@ep-cool-forest-123.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Connection string breakdown:**
```
postgresql://username:password@hostname:port/database?options
    │           │         │        │       │      │       │
    │           │         │        │       │      │       └─ Query parameters
    │           │         │        │       │      └───────── Database name
    │           │         │        │       └──────────────── Port (default: 5432)
    │           │         │        └──────────────────────── Host/Server
    │           │         └───────────────────────────────── Password
    │           └─────────────────────────────────────────── Username
    └─────────────────────────────────────────────────────── Database type
```

### Step 4: Define Your Schema

**Edit `prisma/schema.prisma`:**

```prisma
// 1. Generator: Tells Prisma how to generate the client
generator client {
  provider = "prisma-client-js"  // JavaScript/TypeScript client
}

// 2. Datasource: Database connection configuration
datasource db {
  provider = "postgresql"          // Database type
  url      = env("DATABASE_URL")   // Gets URL from .env file
}

// 3. Models: Define your database tables
model Link {
  // Every field is: name  Type  [modifiers]
  id          String   @id @default(cuid())
  code        String   @unique
  targetUrl   String
  clicks      Int      @default(0)
  lastClicked DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Table-level configuration
  @@index([code])
}
```

**Let's break down each field:**

```prisma
id String @id @default(cuid())
│  │      │   │
│  │      │   └─ @default(cuid()) - Auto-generate unique ID
│  │      └───── @id - This is the primary key
│  └──────────── Type: String (text)
└─────────────── Field name (column name in database)
```

```prisma
code String @unique
│    │      │
│    │      └─ @unique - Database enforces uniqueness
│    └──────── Type: String
└───────────── Field name
```

```prisma
clicks Int @default(0)
│      │   │
│      │   └─ @default(0) - Starts at 0 if not provided
│      └───── Type: Int (integer number)
└──────────── Field name
```

```prisma
lastClicked DateTime?
│           │       │
│           │       └─ ? - Optional (can be NULL)
│           └───────── Type: DateTime (timestamp)
└───────────────────── Field name
```

```prisma
@@index([code])
│       │
│       └─ Fields to index
└───────── Table-level directive (starts with @@)
```

### Step 5: Create Database Migration

```bash
npx prisma migrate dev --name init
```

**What happens step-by-step:**

1. **Prisma reads** `schema.prisma`
2. **Connects** to database using `DATABASE_URL`
3. **Compares** schema to current database state
4. **Generates SQL** migration file
5. **Creates** `prisma/migrations/` folder
6. **Applies** migration to database
7. **Generates** Prisma Client code

**Files created:**

```
prisma/migrations/
├── 20240119000000_init/       ← Timestamped folder
│   └── migration.sql          ← SQL to create tables
└── migration_lock.toml        ← Prevents conflicts
```

**Example `migration.sql`:**

```sql
-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "Link_code_key" ON "Link"("code");

-- CreateIndex
CREATE INDEX "Link_code_idx" ON "Link"("code");
```

### Step 6: Create Prisma Client Singleton

**Create `lib/prisma.ts`:**

```typescript
import { PrismaClient } from '@prisma/client';

// Extend global type to include prisma property
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create or reuse Prisma Client
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In development, save to global object
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Why this pattern?**

```
WITHOUT SINGLETON:
─────────────────────────────────────────
Code Change → Next.js Hot Reload
  ↓
New PrismaClient() → Opens DB Connection #1
  ↓
Code Change → Next.js Hot Reload
  ↓
New PrismaClient() → Opens DB Connection #2
  ↓
Code Change → Next.js Hot Reload
  ↓
New PrismaClient() → Opens DB Connection #3
  ↓
... after 10-20 hot reloads ...
  ↓
ERROR: Too many database connections! ❌


WITH SINGLETON:
─────────────────────────────────────────
Code Change → Next.js Hot Reload
  ↓
Check globalThis.prisma → Not found
  ↓
New PrismaClient() → Opens DB Connection #1
  ↓
Save to globalThis.prisma
  ↓
Code Change → Next.js Hot Reload
  ↓
Check globalThis.prisma → Found! Reuse it
  ↓
No new connection ✓
  ↓
All hot reloads → Still just 1 connection ✓
```

### Step 7: Use Prisma in Your Code

**Import the singleton:**

```typescript
import { prisma } from '@/lib/prisma';
```

**Use it in API routes:**

```typescript
// app/api/links/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const links = await prisma.link.findMany();
  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
  const { targetUrl, code } = await request.json();

  const link = await prisma.link.create({
    data: { code, targetUrl }
  });

  return NextResponse.json(link, { status: 201 });
}
```

---

## 📂 How Each File Works

### 1. `prisma/schema.prisma` - The Schema Definition

**Purpose**: Single source of truth for your database structure

```prisma
// Configuration
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Your data model
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

**What Prisma generates from this:**

1. **TypeScript Types:**
   ```typescript
   type Link = {
     id: string;
     code: string;
     targetUrl: string;
     clicks: number;
     lastClicked: Date | null;
     createdAt: Date;
     updatedAt: Date;
   };
   ```

2. **Query Methods:**
   ```typescript
   prisma.link.findUnique()
   prisma.link.findMany()
   prisma.link.create()
   prisma.link.update()
   prisma.link.delete()
   ```

3. **Migration SQL:**
   ```sql
   CREATE TABLE "Link" (...);
   CREATE UNIQUE INDEX "Link_code_key" ON "Link"("code");
   ```

### 2. `lib/prisma.ts` - The Client Singleton

**Purpose**: Provide a single, reusable Prisma Client instance

```typescript
import { PrismaClient } from '@prisma/client';

// Step 1: Type the global object
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Step 2: Create or reuse client
export const prisma =
  globalForPrisma.prisma  // If exists, use it
  ??
  new PrismaClient();     // Otherwise, create new

// Step 3: Save to global (development only)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Line-by-line explanation:**

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
```
- `globalThis` - Global object (like `window` in browser)
- `as unknown as` - TypeScript type assertion
- `{ prisma: PrismaClient | undefined }` - Says global can have a `prisma` property

```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
```
- `??` - Nullish coalescing operator
- If `globalForPrisma.prisma` exists → use it
- If `undefined` or `null` → create `new PrismaClient()`

```typescript
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```
- Only in development (not production)
- Save client to global object
- Survives Next.js hot reloads

### 3. `.env` - Environment Configuration

**Purpose**: Store sensitive configuration

```env
# Database connection
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"

# Application base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

**How Prisma uses it:**

```prisma
datasource db {
  url = env("DATABASE_URL")
         │
         └─ Reads from .env file
}
```

**Security:**
- ✅ `.env` is in `.gitignore` (not committed)
- ✅ `.env.example` is committed (template without secrets)

### 4. `node_modules/@prisma/client` - Generated Code

**Generated by:** `npx prisma generate`

**Location:** `node_modules/@prisma/client/index.d.ts`

**What it contains:**

```typescript
// Auto-generated TypeScript types
export type Link = {
  id: string
  code: string
  targetUrl: string
  clicks: number
  lastClicked: Date | null
  createdAt: Date
  updatedAt: Date
}

// Auto-generated client
export class PrismaClient {
  link: {
    findUnique<T>(args: {...}): Promise<Link | null>
    findMany<T>(args: {...}): Promise<Link[]>
    create<T>(args: {...}): Promise<Link>
    update<T>(args: {...}): Promise<Link>
    delete<T>(args: {...}): Promise<Link>
    // ... and many more
  }
}
```

**This is why you get autocomplete!**

---

## 🔄 Understanding the Data Flow

### Example: Creating a Link

**1. User fills form on dashboard → Clicks submit**

```typescript
// app/page.tsx (Frontend)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const response = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUrl, code })
  });
};
```

**2. Request hits API route**

```typescript
// app/api/links/route.ts (Backend)
export async function POST(request: NextRequest) {
  const { targetUrl, code } = await request.json();

  // Prisma starts here ↓
  const link = await prisma.link.create({
    data: { code, targetUrl }
  });

  return NextResponse.json(link);
}
```

**3. Prisma translates to SQL**

```typescript
prisma.link.create({ data: { code: "abc", targetUrl: "..." } })
```

**Becomes:**

```sql
INSERT INTO "Link" ("id", "code", "targetUrl", "clicks", "createdAt", "updatedAt")
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- Parameters:
-- $1 = "clx123..." (generated CUID)
-- $2 = "abc"
-- $3 = "https://..."
-- $4 = 0 (default)
-- $5 = CURRENT_TIMESTAMP
-- $6 = CURRENT_TIMESTAMP
```

**4. PostgreSQL executes query**

```
PostgreSQL receives parameterized query
  ↓
Validates constraints (unique code, etc.)
  ↓
Inserts row into Link table
  ↓
Returns inserted row
```

**5. Prisma returns typed result**

```typescript
const link = await prisma.link.create(...);

// link is typed as:
// {
//   id: string,
//   code: string,
//   targetUrl: string,
//   clicks: number,
//   lastClicked: null,
//   createdAt: Date,
//   updatedAt: Date
// }
```

**6. API sends response to frontend**

```typescript
return NextResponse.json(link);
```

**7. Frontend receives and displays**

```typescript
const data = await response.json();
// data is the link object
setSuccessMessage(`Link created! Code: ${data.code}`);
```

### Complete Flow Diagram

```
User Browser                API Route              Prisma Client         PostgreSQL
     │                          │                        │                    │
     │  POST /api/links         │                        │                    │
     │  {targetUrl, code}       │                        │                    │
     ├─────────────────────────>│                        │                    │
     │                          │                        │                    │
     │                          │  prisma.link.create()  │                    │
     │                          ├───────────────────────>│                    │
     │                          │                        │                    │
     │                          │                        │  INSERT INTO Link  │
     │                          │                        ├───────────────────>│
     │                          │                        │                    │
     │                          │                        │   Row inserted     │
     │                          │                        │<───────────────────┤
     │                          │                        │                    │
     │                          │   Link object          │                    │
     │                          │<───────────────────────┤                    │
     │                          │                        │                    │
     │   JSON response          │                        │                    │
     │<─────────────────────────┤                        │                    │
     │                          │                        │                    │
```

---

## 🎬 Prisma in Action

### Example 1: Redirect with Click Tracking

**File:** `app/[code]/route.ts`

```typescript
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // 1. Find link by code
  const link = await prisma.link.findUnique({
    where: { code }
  });

  // 2. If not found, return 404
  if (!link) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 3. Update stats atomically
  await prisma.link.update({
    where: { code },
    data: {
      clicks: { increment: 1 },      // Atomic: clicks = clicks + 1
      lastClicked: new Date()
    }
  });

  // 4. Redirect
  return NextResponse.redirect(link.targetUrl, { status: 302 });
}
```

**What Prisma does:**

**Step 1: Find link**
```typescript
prisma.link.findUnique({ where: { code } })
```
↓
```sql
SELECT * FROM "Link" WHERE "code" = $1 LIMIT 1;
```

**Step 2: Update clicks**
```typescript
prisma.link.update({
  where: { code },
  data: {
    clicks: { increment: 1 },
    lastClicked: new Date()
  }
})
```
↓
```sql
UPDATE "Link"
SET "clicks" = "clicks" + 1,
    "lastClicked" = $2,
    "updatedAt" = $3
WHERE "code" = $1
RETURNING *;
```

**Why `{ increment: 1 }` is special:**

```typescript
// ❌ NOT thread-safe (race condition)
const link = await prisma.link.findUnique({ where: { code } });
await prisma.link.update({
  where: { code },
  data: { clicks: link.clicks + 1 }  // BAD!
});

// ✅ Thread-safe (atomic operation)
await prisma.link.update({
  where: { code },
  data: { clicks: { increment: 1 } }  // GOOD!
});
```

### Example 2: Create Link with Validation

**File:** `app/api/links/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { targetUrl, code } = await request.json();

  // 1. Validate inputs
  if (!isValidUrl(targetUrl)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (code && !isValidCode(code)) {
    return NextResponse.json(
      { error: 'Code must be 6-8 alphanumeric' },
      { status: 400 }
    );
  }

  // 2. Check if code already exists
  const existing = await prisma.link.findUnique({
    where: { code }
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Code already taken' },
      { status: 409 }
    );
  }

  // 3. Create link
  try {
    const link = await prisma.link.create({
      data: { code, targetUrl }
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    // Handle Prisma errors
    if (error.code === 'P2002') {
      // Unique constraint violation
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    throw error;
  }
}
```

**Prisma error codes:**

- `P2002` - Unique constraint failed
- `P2025` - Record not found
- `P2003` - Foreign key constraint failed

### Example 3: List with Filtering and Sorting

```typescript
// Get all links, newest first
const links = await prisma.link.findMany({
  orderBy: { createdAt: 'desc' }
});

// Get popular links (>100 clicks)
const popular = await prisma.link.findMany({
  where: { clicks: { gt: 100 } },
  orderBy: { clicks: 'desc' },
  take: 10
});

// Search by code or URL
const results = await prisma.link.findMany({
  where: {
    OR: [
      { code: { contains: searchQuery } },
      { targetUrl: { contains: searchQuery } }
    ]
  }
});
```

---

## 🚀 Advanced Concepts

### 1. Transactions

When you need multiple operations to succeed or fail together:

```typescript
await prisma.$transaction([
  prisma.link.create({ data: link1 }),
  prisma.link.create({ data: link2 }),
  prisma.link.delete({ where: { code: "old" } })
]);

// If ANY operation fails, ALL are rolled back
```

### 2. Raw SQL (Escape Hatch)

When Prisma's query builder isn't enough:

```typescript
// Still parameterized and safe!
const recentLinks = await prisma.$queryRaw`
  SELECT * FROM "Link"
  WHERE "createdAt" > NOW() - INTERVAL '7 days'
  ORDER BY "clicks" DESC
`;
```

### 3. Middleware (Logging, Timing)

```typescript
const prisma = new PrismaClient().$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = Date.now();
      const result = await query(args);
      const duration = Date.now() - start;

      console.log(`${model}.${operation} took ${duration}ms`);
      return result;
    }
  }
});
```

### 4. Relation Queries (If You Add Users Later)

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  links Link[]
}

model Link {
  id       String @id @default(cuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id])
  // ... other fields
}
```

```typescript
// Get user with all their links
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
  include: { links: true }  // Include related links
});
```

---

## ❓ Common Questions

### Q: When does Prisma Client get generated?

**A:** Automatically in these situations:

1. After `npx prisma migrate dev`
2. When you run `npx prisma generate`
3. After `npm install` (if you have `postinstall` script)

```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Q: Why do I need `npx prisma generate`?

**A:** After changing `schema.prisma`, you need to regenerate the client so TypeScript knows about your changes.

```
Edit schema.prisma
      ↓
Run: npx prisma generate
      ↓
Prisma regenerates TypeScript types
      ↓
Your IDE autocomplete updates
```

### Q: What's the difference between `migrate dev` and `migrate deploy`?

**A:**

```bash
# Development (interactive, can reset DB)
npx prisma migrate dev --name my_migration
# - Creates migration
# - Applies to DB
# - Generates client
# - Can handle data loss

# Production (non-interactive, safe)
npx prisma migrate deploy
# - Only applies pending migrations
# - No prompts
# - Never resets
# - Safe for automation
```

### Q: Can I use Prisma with other databases?

**A:** Yes! Just change the `provider`:

```prisma
datasource db {
  provider = "postgresql"  // or "mysql", "sqlite", "sqlserver", "mongodb"
  url      = env("DATABASE_URL")
}
```

### Q: How do I see what SQL Prisma generates?

**A:** Enable logging:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
```

Now console shows all SQL queries!

### Q: What if migration fails?

**A:**

```bash
# Check status
npx prisma migrate status

# Mark as applied (if manually fixed)
npx prisma migrate resolve --applied "migration_name"

# Start over (⚠️ DELETES DATA)
npx prisma migrate reset
```

---

## 🎓 Summary: How Prisma Integrates

1. **Install** packages: `@prisma/client` and `prisma`
2. **Initialize**: `npx prisma init` creates schema file
3. **Define** your data model in `schema.prisma`
4. **Migrate**: `npx prisma migrate dev` creates database
5. **Generate**: Client is auto-generated with types
6. **Create singleton** in `lib/prisma.ts`
7. **Import and use** `prisma` in your code
8. **Deploy**: `npx prisma migrate deploy` in production

**Key files:**
- `prisma/schema.prisma` - Your database design
- `lib/prisma.ts` - Singleton client instance
- `.env` - Database connection string
- `node_modules/@prisma/client` - Generated code (don't edit!)

**Key commands:**
- `npx prisma generate` - Regenerate client
- `npx prisma migrate dev` - Create & apply migration
- `npx prisma studio` - Open database GUI
- `npx prisma migrate deploy` - Deploy to production

---

**You now understand exactly how Prisma is integrated into TinyLink! 🎉**

For more: [prisma.io/docs](https://www.prisma.io/docs)
