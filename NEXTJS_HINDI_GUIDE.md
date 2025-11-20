# Next.js Complete Guide - Hindi mein

TinyLink project ke through Next.js sikhiye - Step by step, Hindi mein!

## 📚 Index (Chapters)

1. [Next.js Kya Hai?](#nextjs-kya-hai)
2. [Folder Structure Samjho](#folder-structure-samjho)
3. [Routing System](#routing-system)
4. [Request Ka Safar](#request-ka-safar)
5. [API Routes](#api-routes)
6. [Frontend (React Components)](#frontend-react-components)
7. [Complete Flow Diagrams](#complete-flow-diagrams)
8. [Interview Ke Liye](#interview-ke-liye)

---

## 🎯 Next.js Kya Hai?

### Simple Language Mein

**Traditional React** (Create React App):
```
Browser → React App (Frontend only)
          ↓
          Separate Backend needed (Express, etc.)
```

**Next.js** (Full-stack Framework):
```
Browser → Next.js
          ↓
          Frontend (React) + Backend (API Routes) - Ek hi project mein!
```

### Fayde (Advantages)

1. **Full-stack** - Frontend aur Backend dono ek saath
2. **File-based Routing** - Folders se routes automatically bante hain
3. **Server-side Rendering** - Fast loading
4. **Easy Deployment** - Vercel pe ek click mein deploy

### Comparison

```
┌─────────────────────────────────────────────────┐
│  Traditional Setup (Purana Tarika)             │
├─────────────────────────────────────────────────┤
│  Frontend:  React App (Port 3000)              │
│  Backend:   Express Server (Port 5000)         │
│  Database:  PostgreSQL (Port 5432)             │
│  Deploy:    3 alag jagah deploy karo           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Next.js Setup (Naya Tarika)                   │
├─────────────────────────────────────────────────┤
│  Frontend + Backend:  Next.js (Port 3000)      │
│  Database:  PostgreSQL (Port 5432)             │
│  Deploy:    Sirf 1 jagah deploy karo           │
└─────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure Samjho

### Hamara TinyLink Project

```
tinylink/
├── app/                      ← Ye sabse important folder hai!
│   ├── [code]/              ← Dynamic route (/:code)
│   │   └── route.ts         ← Redirect handler
│   │
│   ├── api/                 ← Backend API routes
│   │   └── links/
│   │       ├── route.ts     ← /api/links endpoint
│   │       └── [code]/
│   │           └── route.ts ← /api/links/:code endpoint
│   │
│   ├── code/                ← Stats page route
│   │   └── [code]/
│   │       └── page.tsx     ← /code/:code page
│   │
│   ├── healthz/             ← Health check route
│   │   └── route.ts         ← /healthz endpoint
│   │
│   ├── layout.tsx           ← Root layout (header/footer)
│   ├── page.tsx             ← Dashboard (/ homepage)
│   └── globals.css          ← Global styles
│
├── lib/                      ← Helper files
│   └── prisma.ts            ← Database client
│
├── prisma/                   ← Database schema
│   └── schema.prisma        ← Table definitions
│
├── package.json             ← Dependencies
├── .env                     ← Environment variables
└── next.config.ts           ← Next.js configuration
```

### Folder Ka Matlab Routes

```
Folder Path              →  Browser URL
─────────────────────────────────────────────
app/page.tsx             →  http://localhost:3000/
app/about/page.tsx       →  http://localhost:3000/about
app/blog/page.tsx        →  http://localhost:3000/blog
app/[code]/route.ts      →  http://localhost:3000/abc123
app/api/links/route.ts   →  http://localhost:3000/api/links
app/code/[code]/page.tsx →  http://localhost:3000/code/abc123
```

### File Types

**page.tsx** = UI page (user dekhta hai)
**route.ts** = API endpoint (data return karta hai)
**layout.tsx** = Wrapper (header/footer har page pe)

---

## 🛣️ Routing System

### 1. Static Routes (Fixed URLs)

```
app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
└── contact/
    └── page.tsx          → /contact
```

**Example:**
```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

### 2. Dynamic Routes (Variable URLs)

```
app/
└── [code]/
    └── page.tsx          → /abc123, /xyz789, /kuchbhi
```

**Square brackets `[code]`** = Variable parameter

**Example:**
```typescript
// app/[code]/page.tsx
export default async function RedirectPage({
  params
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params;
  return <div>Code: {code}</div>;
}
```

### 3. API Routes

```
app/api/
├── links/
│   ├── route.ts          → GET/POST /api/links
│   └── [code]/
│       └── route.ts      → GET/DELETE /api/links/:code
```

**Example:**
```typescript
// app/api/links/route.ts
export async function GET() {
  return Response.json({ message: "Hello" });
}
```

### TinyLink Ke Routes

```
┌────────────────────────────────────────────────┐
│  File Path                 →  URL              │
├────────────────────────────────────────────────┤
│  app/page.tsx              →  /                │
│  app/[code]/route.ts       →  /abc123          │
│  app/code/[code]/page.tsx  →  /code/abc123     │
│  app/api/links/route.ts    →  /api/links       │
│  app/healthz/route.ts      →  /healthz         │
└────────────────────────────────────────────────┘
```

---

## 🚀 Request Ka Safar (Journey of a Request)

### Example 1: Dashboard Kholo

```
┌─────────────────────────────────────────────────────────┐
│  User Browser mein type karta hai                      │
│  http://localhost:3000                                  │
└────────────┬────────────────────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────────────────┐
│  Next.js Router                                        │
│  "/ kaunsa file hai?"                                  │
│  → app/page.tsx milta hai                              │
└────────────┬───────────────────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────────────────┐
│  app/layout.tsx (Root Layout)                          │
│  Header aur Footer add hota hai                        │
└────────────┬───────────────────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────────────────┐
│  app/page.tsx (Dashboard Component)                    │
│  1. Component render hota hai                          │
│  2. useEffect() chalti hai                             │
│  3. fetch('/api/links') call hota hai                  │
└────────────┬───────────────────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────────────────┐
│  API Call: GET /api/links                              │
│  → app/api/links/route.ts pe jata hai                  │
└────────────┬───────────────────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────────────────┐
│  app/api/links/route.ts                                │
│  1. prisma.link.findMany() chalata hai                 │
│  2. Database se data fetch karta hai                   │
│  3. JSON response return karta hai                     │
└────────────┬───────────────────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────────────────┐
│  Database (PostgreSQL)                                 │
│  SELECT * FROM Link ORDER BY createdAt DESC            │
└────────────┬───────────────────────────────────────────┘
             │
             ↓ (Data wapas aata hai)
┌────────────────────────────────────────────────────────┐
│  Dashboard Component (page.tsx)                        │
│  1. Data receive karta hai                             │
│  2. setLinks(data) - State update                      │
│  3. Component re-render                                │
│  4. Table mein links dikhate hain                      │
└────────────┬───────────────────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────────────────┐
│  Browser Screen                                        │
│  User ko dashboard with links dikhai deta hai          │
└────────────────────────────────────────────────────────┘
```

### Example 2: Short Link Use Karo

```
User visits: http://localhost:3000/github
                     │
                     ↓
         ┌───────────────────────┐
         │   Next.js Router      │
         │   Pattern match:      │
         │   /github = /[code]   │
         └───────┬───────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │  app/[code]/route.ts       │
    │  GET function chalti hai   │
    │  params = { code: "github" }│
    └────────┬───────────────────┘
             │
             ↓
┌────────────────────────────────────┐
│  Database Query                    │
│  prisma.link.findUnique({          │
│    where: { code: "github" }       │
│  })                                │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│  Link mil gaya!                    │
│  {                                 │
│    code: "github",                 │
│    targetUrl: "https://github.com" │
│  }                                 │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│  Click count badhao (Update)       │
│  prisma.link.update({              │
│    data: {                         │
│      clicks: { increment: 1 }      │
│    }                               │
│  })                                │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│  302 Redirect                      │
│  NextResponse.redirect(            │
│    "https://github.com"            │
│  )                                 │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│  Browser                           │
│  Automatically github.com pe       │
│  chala jata hai                    │
└────────────────────────────────────┘
```

---

## 🔌 API Routes

### API Route Kya Hai?

**Simple definition:**
- Browser se data lene/dene ke liye endpoints
- Backend API jaise kaam karte hain
- JSON data return karte hain

### Basic Structure

```typescript
// app/api/hello/route.ts

// GET request ke liye
export async function GET() {
  return Response.json({ message: "Hello" });
}

// POST request ke liye
export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ received: body });
}
```

### TinyLink Ke API Routes

#### 1. Create Link (POST /api/links)

```typescript
// app/api/links/route.ts

export async function POST(request: NextRequest) {
  // Step 1: Request se data lo
  const { targetUrl, code } = await request.json();

  // Step 2: Validation
  if (!isValidUrl(targetUrl)) {
    return NextResponse.json(
      { error: 'Invalid URL' },
      { status: 400 }
    );
  }

  // Step 3: Database mein check karo - code exist karta hai?
  const exists = await prisma.link.findUnique({
    where: { code }
  });

  if (exists) {
    return NextResponse.json(
      { error: 'Code already taken' },
      { status: 409 }  // 409 = Conflict
    );
  }

  // Step 4: Link create karo
  const link = await prisma.link.create({
    data: { code, targetUrl }
  });

  // Step 5: Response bhejo
  return NextResponse.json(link, { status: 201 });
}
```

**Flow diagram:**

```
POST /api/links
{ targetUrl: "https://...", code: "abc" }
         │
         ↓
┌────────────────┐
│ Validate URL   │ → Invalid? → 400 Error
└────────┬───────┘
         │ Valid
         ↓
┌────────────────┐
│ Check if code  │ → Exists? → 409 Error
│ already exists │
└────────┬───────┘
         │ Not exists
         ↓
┌────────────────┐
│ Create in DB   │
└────────┬───────┘
         │
         ↓
     201 Created
{ id, code, targetUrl, clicks: 0, ... }
```

#### 2. List All Links (GET /api/links)

```typescript
export async function GET() {
  // Database se saare links lo
  const links = await prisma.link.findMany({
    orderBy: { createdAt: 'desc' }  // Naye pehle
  });

  // JSON return karo
  return NextResponse.json(links);
}
```

#### 3. Get One Link (GET /api/links/:code)

```typescript
// app/api/links/[code]/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  // URL se code parameter lo
  const { code } = await params;

  // Database se dhundo
  const link = await prisma.link.findUnique({
    where: { code }
  });

  // Nahi mila?
  if (!link) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  // Mil gaya, return karo
  return NextResponse.json(link);
}
```

#### 4. Delete Link (DELETE /api/links/:code)

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Database se delete karo
  await prisma.link.delete({
    where: { code }
  });

  return NextResponse.json({ message: 'Deleted' });
}
```

### HTTP Methods

```
GET     → Data padhna (Read)
POST    → Naya data banana (Create)
PUT     → Pura data update karna (Replace)
PATCH   → Thoda sa update karna (Modify)
DELETE  → Data delete karna (Delete)
```

---

## 🎨 Frontend (React Components)

### Component Kya Hai?

**Simple definition:** UI ka ek piece jo reusable hai

```typescript
// Simple component
function Greeting() {
  return <h1>Namaste!</h1>;
}

// Component with props
function Greeting({ name }: { name: string }) {
  return <h1>Namaste, {name}!</h1>;
}

// Use karo
<Greeting name="Raj" />  // Output: Namaste, Raj!
```

### React Hooks (Important Concepts)

#### 1. useState - State Management

```typescript
// State = Component ki memory

const [count, setCount] = useState(0);
//     │       │                  │
//     │       │                  └─ Initial value
//     │       └──────────────────── Setter function (update karne ke liye)
//     └──────────────────────────── Current value

// Use karo
<button onClick={() => setCount(count + 1)}>
  Count: {count}
</button>
```

**Example from TinyLink:**

```typescript
// app/page.tsx
const [links, setLinks] = useState<Link[]>([]);
//     │        │                           │
//     │        │                           └─ Empty array initially
//     │        └─────────────────────────── Update function
//     └──────────────────────────────────── Links ka array

const [loading, setLoading] = useState(true);
//     │          │                      │
//     │          │                      └─ Initially loading hai
//     │          └────────────────────── Loading state change karo
//     └───────────────────────────────── Loading status
```

#### 2. useEffect - Side Effects

```typescript
// Side effects = API calls, subscriptions, etc.

useEffect(() => {
  // Ye code component mount hone pe chalega
  fetchLinks();
}, []);
// │
// └─ Dependency array
//    [] = Sirf ek baar (component mount pe)
//    [count] = Jab count change ho
```

**Example from TinyLink:**

```typescript
useEffect(() => {
  const fetchLinks = async () => {
    const response = await fetch('/api/links');
    const data = await response.json();
    setLinks(data);
  };

  fetchLinks();
}, []);  // Empty array = sirf ek baar chalega
```

**Flow:**

```
Component mount hota hai
         ↓
useEffect chalti hai
         ↓
fetchLinks() call hota hai
         ↓
API se data aata hai
         ↓
setLinks(data) - State update
         ↓
Component re-render hota hai
         ↓
Links table mein dikhai dete hain
```

### Dashboard Component Breakdown

```typescript
// app/page.tsx

export default function Dashboard() {
  // 1. STATE MANAGEMENT
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. DATA FETCHING
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/links');
      const data = await response.json();
      setLinks(data);
    } catch (err) {
      setError('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  // 3. EVENT HANDLERS
  const handleDelete = async (code: string) => {
    await fetch(`/api/links/${code}`, { method: 'DELETE' });
    fetchLinks();  // Refresh list
  };

  // 4. RENDER UI
  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {!loading && links.map(link => (
        <div key={link.id}>
          {link.code} → {link.targetUrl}
          <button onClick={() => handleDelete(link.code)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Complete Flow Diagrams

### 1. Full Application Architecture

```
┌──────────────────────────────────────────────────────┐
│                    User Browser                      │
│  (Chrome, Firefox, Safari)                           │
└────────────┬─────────────────────────────────────────┘
             │
             │ HTTP Requests
             ↓
┌──────────────────────────────────────────────────────┐
│              Next.js Application                     │
│  (Port 3000)                                         │
│                                                      │
│  ┌────────────────────┐    ┌─────────────────────┐ │
│  │   Frontend (UI)    │    │  Backend (API)      │ │
│  │                    │    │                     │ │
│  │  • page.tsx        │    │  • route.ts         │ │
│  │  • React           │    │  • GET, POST, etc.  │ │
│  │  • Tailwind CSS    │    │  • JSON responses   │ │
│  │  • useState        │    │                     │ │
│  │  • useEffect       │    │                     │ │
│  └─────────┬──────────┘    └──────┬──────────────┘ │
│            │                       │                │
│            │  fetch('/api/...')    │                │
│            └──────────────────────>│                │
│                                    │                │
└────────────────────────────────────┼────────────────┘
                                     │
                                     │ Prisma ORM
                                     ↓
                         ┌───────────────────────┐
                         │   PostgreSQL DB       │
                         │   (Port 5432)         │
                         │                       │
                         │  ┌─────────────────┐ │
                         │  │   Link Table    │ │
                         │  │  • id           │ │
                         │  │  • code         │ │
                         │  │  • targetUrl    │ │
                         │  │  • clicks       │ │
                         │  └─────────────────┘ │
                         └───────────────────────┘
```

### 2. Link Create Karne Ka Complete Flow

```
Step 1: User Form Bharti Hai
┌─────────────────────────┐
│  Dashboard (/)          │
│  ┌───────────────────┐  │
│  │ Target URL: _____ │  │
│  │ Custom Code: ____ │  │
│  │  [Create Link]    │  │
│  └───────────────────┘  │
└────────┬────────────────┘
         │ User clicks "Create"
         ↓

Step 2: Form Submit Event
┌─────────────────────────┐
│  handleSubmit()         │
│  e.preventDefault()     │
└────────┬────────────────┘
         │
         ↓

Step 3: API Call
┌──────────────────────────────────┐
│  fetch('/api/links', {           │
│    method: 'POST',               │
│    body: JSON.stringify({        │
│      targetUrl: "...",           │
│      code: "abc"                 │
│    })                            │
│  })                              │
└────────┬─────────────────────────┘
         │
         ↓

Step 4: Backend Processing
┌──────────────────────────────────┐
│  app/api/links/route.ts          │
│  ┌────────────────────────────┐  │
│  │ 1. URL validate karo       │  │
│  │ 2. Code validate karo      │  │
│  │ 3. Duplicate check karo    │  │
│  │ 4. Database mein insert    │  │
│  └────────────────────────────┘  │
└────────┬─────────────────────────┘
         │
         ↓

Step 5: Database Operation
┌──────────────────────────────────┐
│  prisma.link.create({            │
│    data: {                       │
│      code: "abc",                │
│      targetUrl: "..."            │
│    }                             │
│  })                              │
└────────┬─────────────────────────┘
         │
         ↓

Step 6: PostgreSQL
┌──────────────────────────────────┐
│  INSERT INTO Link                │
│  (id, code, targetUrl, ...)      │
│  VALUES (...)                    │
└────────┬─────────────────────────┘
         │
         ↓ Success!

Step 7: Response Wapas
┌──────────────────────────────────┐
│  201 Created                     │
│  {                               │
│    id: "clx123",                 │
│    code: "abc",                  │
│    targetUrl: "...",             │
│    clicks: 0                     │
│  }                               │
└────────┬─────────────────────────┘
         │
         ↓

Step 8: Frontend Update
┌──────────────────────────────────┐
│  setSuccessMessage(...)          │
│  fetchLinks() - Refresh list     │
└────────┬─────────────────────────┘
         │
         ↓

Step 9: UI Update
┌──────────────────────────────────┐
│  ✓ Link created successfully!    │
│                                  │
│  Code  | Target URL | Clicks     │
│  ─────────────────────────────   │
│  abc   | https://... | 0         │
└──────────────────────────────────┘
```

### 3. Redirect Flow

```
User visits: http://localhost:3000/abc123

┌────────────────┐
│  Browser       │
│  GET /abc123   │
└───────┬────────┘
        │
        ↓
┌────────────────────────────┐
│  Next.js Router            │
│  "/abc123" matches         │
│  app/[code]/route.ts       │
│  params = { code: "abc123" }│
└───────┬────────────────────┘
        │
        ↓
┌────────────────────────────┐
│  app/[code]/route.ts       │
│  GET function              │
│                            │
│  const { code } =          │
│    await params;           │
└───────┬────────────────────┘
        │
        ↓
┌────────────────────────────┐
│  Database Query            │
│  prisma.link.findUnique({  │
│    where: { code }         │
│  })                        │
└───────┬────────────────────┘
        │
        ↓
┌────────────────────────────┐
│  Link mil gaya?            │
└───┬─────────────┬──────────┘
    │             │
 Yes│             │No
    │             ↓
    │      ┌──────────────┐
    │      │ 404 Not Found│
    │      └──────────────┘
    ↓
┌────────────────────────────┐
│  Update Clicks             │
│  prisma.link.update({      │
│    data: {                 │
│      clicks: {increment: 1}│
│    }                       │
│  })                        │
└───────┬────────────────────┘
        │
        ↓
┌────────────────────────────┐
│  302 Redirect              │
│  Location: targetUrl       │
└───────┬────────────────────┘
        │
        ↓
┌────────────────────────────┐
│  Browser automatically     │
│  navigates to target URL   │
└────────────────────────────┘
```

---

## 🎓 Interview Ke Liye

### Important Concepts Hindi Mein

#### 1. Server-side vs Client-side

```
Server-side (route.ts):
- Server pe chalti hai
- Database access kar sakti hai
- Secure hai (secrets use kar sakte hain)
- User ko code nahi dikhta

Client-side (page.tsx):
- Browser mein chalti hai
- Database direct access nahi kar sakti
- User ko code dikhta hai (View Source)
- Interactive UI ke liye
```

#### 2. File-based Routing

```
Purana tarika (React Router):
<Route path="/" component={Home} />
<Route path="/about" component={About} />
<Route path="/blog/:id" component={Blog} />

Naya tarika (Next.js):
app/page.tsx              →  /
app/about/page.tsx        →  /about
app/blog/[id]/page.tsx    →  /blog/:id
```

#### 3. Dynamic Parameters

```typescript
// app/[code]/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  // code = URL se jo bhi aaya (abc, xyz, etc.)
}
```

**URL**: `/abc123`
**code**: `"abc123"`

**URL**: `/github`
**code**: `"github"`

### Common Interview Questions

**Q: Next.js React se kaise different hai?**

**A:**
- Next.js = React + Backend + Routing
- React = Sirf frontend library
- Next.js mein API routes bhi bana sakte hain

**Q: page.tsx aur route.ts mein kya fark hai?**

**A:**
- `page.tsx` = UI page (HTML return karta hai)
- `route.ts` = API endpoint (JSON return karta hai)

**Q: Dynamic routing kaise kaam karta hai?**

**A:**
- Square brackets `[code]` use karo
- Ye variable ban jata hai
- URL se value milti hai

**Q: useEffect kyu use karte hain?**

**A:**
- API calls ke liye
- Component mount hone pe ek baar code chalana ho
- Data fetch karna ho

**Q: useState kyu use karte hain?**

**A:**
- Component ki memory ke liye
- Data change ho to UI update ho

---

## 🎯 Quick Reference Hindi Mein

### Folder Structure

```
app/
├── page.tsx          → Homepage (/)
├── layout.tsx        → Wrapper (har page pe same)
├── [param]/
│   └── page.tsx      → Dynamic page
├── api/
│   └── route.ts      → API endpoint
└── globals.css       → Global styles
```

### File Types

```
page.tsx    → UI page (user dekhega)
route.ts    → API endpoint (JSON data)
layout.tsx  → Common wrapper (header/footer)
loading.tsx → Loading state
error.tsx   → Error page
```

### HTTP Methods

```
GET     → Data padhna
POST    → Naya data banana
DELETE  → Data delete karna
PUT     → Pura update
PATCH   → Partial update
```

### React Hooks

```typescript
// State
const [value, setValue] = useState(initial);

// Effect (side effects)
useEffect(() => {
  // Code here
}, [dependencies]);

// Use hook (async params)
const params = use(paramsPromise);
```

### Prisma Operations

```typescript
// Create
await prisma.link.create({ data: {...} });

// Read one
await prisma.link.findUnique({ where: {id} });

// Read many
await prisma.link.findMany();

// Update
await prisma.link.update({ where: {id}, data: {...} });

// Delete
await prisma.link.delete({ where: {id} });
```

---

## 📝 Summary (Sankshipt Mein)

### TinyLink Ka Pura Flow

1. **User browser mein URL type karta hai** → Next.js router match karta hai
2. **Router file dhundhta hai** → Folder structure se
3. **File execute hoti hai** → page.tsx ya route.ts
4. **Database query** → Prisma use karke
5. **Response milta hai** → JSON ya HTML
6. **Browser render karta hai** → User ko dikhta hai

### Important Points

✅ Next.js = Frontend + Backend ek saath
✅ Folder structure = Routes automatically
✅ page.tsx = UI page
✅ route.ts = API endpoint
✅ [param] = Dynamic route
✅ useState = Component memory
✅ useEffect = Side effects (API calls)
✅ Prisma = Database access (type-safe)

---

**Ab aap Next.js samajh gaye! Kisi ko bhi samjha sakte ho! 🎉**

**Aur questions?** README.md aur EXPLANATION.md padhiye!
