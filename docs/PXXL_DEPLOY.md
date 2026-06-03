# Fix Pxxl deploy — "unsupported language: unknown"

## Why it failed

Your screenshot shows:

- **Root directory:** `/` (repo root)
- **Port:** `3000`
- **Framework:** Not detected

StockGuard is a **monorepo**: code lives in `backend/` and `frontend/`. There is **no** `package.json` at the repo root, so Pxxl cannot detect Node/React and shows **unsupported language: unknown**.

You must **not** deploy from `/` alone. Deploy **`backend`** and **`frontend`** as separate apps (or use Docker — see below).

---

## Option A — Two Pxxl projects (recommended)

### 1) MySQL database on Pxxl

1. In Pxxl dashboard → **Databases** → create **MySQL**.
2. Copy the connection string (looks like `mysql://user:pass@host:3306/db`).

### 2) Backend API project

Create a **new** project from the same GitHub repo:

| Setting | Value |
|---------|--------|
| **Root directory** | `backend` |
| **Port** | `4000` |
| **Framework** | Node.js (should auto-detect after root is set) |

**Environment variables:**

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://....(from Pxxl MySQL)
JWT_SECRET=your-long-random-secret-min-16-chars
CORS_ORIGIN=https://stockguard.pxxl.click,http://localhost:5173
RESERVATION_TTL_MINUTES=5
```

After deploy, open: `https://YOUR-API-URL/health` → should return `"status":"ok"`.

### 3) Frontend project

Create **another** Pxxl project (same repo):

| Setting | Value |
|---------|--------|
| **Root directory** | `frontend` |
| **Port** | `3000` |
| **Build command** | `npm run build` |
| **Start command** | `npm start` |

**Environment variable:**

```env
VITE_API_URL=https://YOUR-API-URL
```

Rebuild after setting `VITE_API_URL` (Vite bakes it in at build time).

Your live demo URL = **frontend** URL (e.g. `https://stockguard.pxxl.click`).

---

## Option B — Single Docker deploy (API only)

If Pxxl supports **Dockerfile** deploy from repo root:

| Setting | Value |
|---------|--------|
| **Root directory** | `/` |
| **Dockerfile** | `Dockerfile` (at repo root) |
| **Port** | `4000` |

Set the same env vars as the backend above. You still need MySQL and a separate frontend deploy (or host frontend on Vercel pointing at this API).

---

## Option C — Pxxl "Multiple Services"

If your plan has **Multiple Services: Enabled**:

1. Service 1: path `backend`, port `4000`
2. Service 2: path `frontend`, port `3000`, env `VITE_API_URL` → internal API URL

---

## Wrong settings (what you had)

| Setting | Wrong | Correct |
|---------|-------|---------|
| Root `/` | No app here | `backend` or `frontend` |
| Port `3000` for root | API uses **4000** | Backend **4000**, frontend **3000** |
| One project for whole repo | Monorepo | **Two** projects or Multiple Services |

---

## After deploy

1. Paste frontend URL in `README.md` (Live demo).
2. Record Loom using the **live** URL.
3. Test: Reserve → countdown → payment → Pay.

---

## CLI (optional)

```bash
npm i -g pxxl-cli   # if available from pxxl.app docs
cd backend
pxxl launch
pxxl env set DATABASE_URL=...
pxxl ship
```

Repeat for `frontend/` with `VITE_API_URL`.
