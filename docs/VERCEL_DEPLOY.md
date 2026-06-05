# Deploy StockGuard frontend on Vercel

## Why you saw this error

```text
react-scripts: command not found
Command "react-scripts build" exited with 127
```

**StockGuard uses Vite, not Create React App.**  
Vercel guessed the wrong framework because you deployed from the **repo root** (`/`), which has no frontend `package.json` at that level.

---

## Fix — Vercel project settings

### Option A (recommended): Root Directory = `frontend`

1. Vercel dashboard → your project → **Settings** → **General**
2. **Root Directory** → Edit → set to **`frontend`**
3. **Framework Preset** → **Vite** (not Create React App)
4. **Build Command** → `npm run build`
5. **Output Directory** → `dist`
6. **Install Command** → `npm install`

### Option B: Deploy from repo root

We added **`vercel.json`** at the repo root — it builds `frontend/` automatically.  
Redeploy after pulling latest `main`.

---

## Environment variable (required)

Vercel → **Settings** → **Environment Variables**:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-API-ON-PXXL.pxxl.click` |

Example:

```env
VITE_API_URL=https://stockguard-api.pxxl.click
```

No trailing slash. **Redeploy** after adding this (Vite bakes it in at build time).

---

## What runs where

| Part | Host |
|------|------|
| **Frontend (UI)** | Vercel ✅ |
| **API + MySQL** | Pxxl (or Railway DB + Pxxl API) |

Vercel **cannot** run the Node API + MySQL + cron — only the static React build.

---

## Redeploy steps

1. Pull latest GitHub (`vercel.json` added)
2. Set Root Directory = **`frontend`** (Option A)
3. Set `VITE_API_URL` to your live API URL
4. **Deployments** → **Redeploy**

---

## Test

1. Open your Vercel URL (e.g. `https://stockguard.vercel.app`)
2. Product should load
3. Click **Reserve** — if it fails, API URL or CORS is wrong

On **Pxxl API**, set:

```env
CORS_ORIGIN=https://your-app.vercel.app
```

Redeploy the API after changing CORS.

---

## Correct vs wrong

| Setting | Wrong | Correct |
|---------|-------|---------|
| Root Directory | `/` (empty) | `frontend` |
| Build | `react-scripts build` | `npm run build` |
| Output | `build` | `dist` |
| Framework | Create React App | **Vite** |
