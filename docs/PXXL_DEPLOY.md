# StockGuard — Pxxl deployment (problem & solution)

Use this guide to redeploy after the `unsupported language: unknown` error.

---

## Problem

Pxxl scans the **repo root** (`/`) and only sees `docker-compose.yml` — there is **no** `package.json` at the root. The app lives in subfolders:

- `backend/` — Node.js API  
- `frontend/` — React UI  

So Pxxl shows:

```text
Project Creation Failed: unsupported language: unknown
```

**Do not deploy from `/`.** Set **Root Directory** to `backend` or `frontend`.

---

## Solution overview

| # | What | Where |
|---|------|--------|
| 1 | MySQL | Pxxl database **or** [Railway](./DATABASE_SETUP.md) if Pxxl DB fails |
| 2 | API | Pxxl project → Root: **`backend`**, Port: **`4000`** |
| 3 | UI | Pxxl project → Root: **`frontend`**, Port: **`3000`** (or Vercel) |

---

## Step 1 — Database (MySQL)

### On Pxxl

| Field | Value |
|--------|--------|
| Type | **MySQL** |
| Name | `stockguard-db` (or `sg-habimana-2026` if name is taken) |
| Server | `db.pxxl.pro` |
| Daily backups | **Unchecked** (Pro only) |

Click **Create Database**. Copy the full **connection string** from the database dashboard.

Example format:

```text
mysql://USER:PASSWORD@db.pxxl.pro:3306/stockguard-db
```

### If Create Database fails

Use free MySQL on **Railway** instead — see [DATABASE_SETUP.md](./DATABASE_SETUP.md).  
Paste that URL as `DATABASE_URL` in Step 2 (works the same).

---

## Step 2 — Backend API on Pxxl

Create a **new** project → GitHub → **Habimana06/StockGuard** → branch **`main`**.

### Project settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Port** | `4000` |
| **Install command** (if asked) | `npm ci` |
| **Build command** | `npx prisma generate && npm run build` |
| **Start command** | `npx prisma migrate deploy && (npx prisma db seed \|\| true) && node dist/index.js` |

If Pxxl auto-detects Node.js, you may only need to set **Root Directory** and **Port**; add build/start commands manually if the deploy fails.

### Environment variables

Add these in Pxxl → **Environment Variables**:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://USER:PASSWORD@db.pxxl.pro:3306/stockguard-db
JWT_SECRET=your-long-random-secret-min-16-characters
CORS_ORIGIN=https://stockguard.pxxl.click,http://localhost:5173
RESERVATION_TTL_MINUTES=5
```

Replace:

| Variable | Replace with |
|----------|----------------|
| `DATABASE_URL` | Full string from Pxxl MySQL **or** Railway |
| `JWT_SECRET` | Any secret string, **16+ characters** |
| `CORS_ORIGIN` | Your **frontend** URL (e.g. `https://stockguard.pxxl.click`) |

### Deploy & verify

1. Click **Deploy Project**.
2. Wait until the build is **Running**.
3. Open: `https://YOUR-API-DOMAIN/health`  
4. Expected JSON: `"status":"ok"` and `"database":"connected"`.

Example API URL: `https://stockguard-api.pxxl.click/health`

---

## Step 3 — Frontend

### Option A — Pxxl (same platform, recommended for submission)

Create a **second** Pxxl project (same GitHub repo).

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Port** | `3000` |
| **Build command** | `npm ci && npm run build` |
| **Start command** | `npm start` |

**Environment variable** (set **before** build):

```env
VITE_API_URL=https://YOUR-API-URL-FROM-STEP-2
```

Example:

```env
VITE_API_URL=https://stockguard-api.pxxl.click
```

No trailing slash. **Redeploy** after changing `VITE_API_URL`.

**Live demo URL** = this frontend domain (e.g. `https://stockguard.pxxl.click`).

### Option B — Vercel or Netlify

| Setting | Value |
|---------|--------|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Env var | `VITE_API_URL=https://YOUR-API-URL` |

Still deploy the **API on Pxxl** (Step 2). Only the UI is on Vercel/Netlify.

---

## Step 4 — Redeploy checklist

Use this order every time you change config:

- [ ] MySQL running and `DATABASE_URL` is correct  
- [ ] Backend: Root = `backend`, Port = `4000`, env vars saved  
- [ ] `/health` returns ok  
- [ ] Frontend: Root = `frontend`, `VITE_API_URL` = API URL  
- [ ] Frontend **rebuilt** after env change  
- [ ] Site: Reserve → countdown → payment → Pay works  
- [ ] Paste live URL + Loom link in `README.md`  

---

## Wrong vs correct (quick reference)

| Setting | Wrong | Correct |
|---------|-------|---------|
| Root directory | `/` | `backend` or `frontend` |
| Port (API) | `3000` | `4000` |
| Port (UI) | `4000` | `3000` |
| One project for whole repo | Yes | **Two** projects |
| `VITE_API_URL` missing | UI cannot call API | Must match API URL |
| Deploy UI before API | Health fails | API first, then UI |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `unsupported language: unknown` | Root Directory = `backend` or `frontend`, not `/` |
| Build fails on Prisma | Build command includes `npx prisma generate` |
| `/health` database unavailable | Fix `DATABASE_URL`; use Railway if Pxxl DB failed |
| UI loads, Reserve fails | Set `VITE_API_URL`, **redeploy frontend** |
| CORS error | Add frontend URL to `CORS_ORIGIN` on backend, redeploy API |
| Pxxl DB create fails | [DATABASE_SETUP.md](./DATABASE_SETUP.md) → Railway MySQL |

---

## Copy-paste template (`backend/.env` for local only)

For **local** Docker, use `backend/.env`. On **Pxxl**, use the dashboard env vars above (not the file).

```env
DATABASE_URL=mysql://stockguard:stockguard@127.0.0.1:3307/stockguard
JWT_SECRET=your-long-random-secret-min-16-characters
PORT=4000
CORS_ORIGIN=http://localhost:5173
RESERVATION_TTL_MINUTES=5
```

---

## Related docs

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) — MySQL on Railway if Pxxl DB fails  
- [SUBMISSION.md](./SUBMISSION.md) — GitHub + Loom + live URL  
