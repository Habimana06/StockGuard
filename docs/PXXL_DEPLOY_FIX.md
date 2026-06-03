# Deploy still failing? — Fix checklist (database OK)

Your MySQL is created. If the **app deploy** still fails, follow this exactly.

---

## Step A — Backend project settings on Pxxl

Delete the old failed project if it used Root `/`. Create **new** project:

| Field | Must be |
|-------|---------|
| **Root Directory** | `backend` |
| **Port** | `4000` |
| **Install** | `npm install` |
| **Build** | `npm run build` |
| **Start** | `npm run start:deploy` |

Or use Start command:

```bash
sh scripts/start-deploy.sh
```

---

## Step B — Environment variables (all required)

Copy from Pxxl **database dashboard** → connection string.  
If password has `@ # % &`, URL-encode it or reset password to letters+numbers only.

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
JWT_SECRET=StockGuardJwtSecret2026Min16
CORS_ORIGIN=https://stockguard.pxxl.click
RESERVATION_TTL_MINUTES=5
```

**JWT_SECRET** must be **at least 16 characters** or the app crashes on start.

**CORS_ORIGIN** = your frontend URL (change when frontend is live).

---

## Step C — Read the build log on Pxxl

Open **Logs** / **Deployments** and find the first red error:

| Log message | Fix |
|-------------|-----|
| `unsupported language` | Root Directory must be `backend` |
| `tsc: not found` / `typescript` | Build command: `npm run build` (we moved TypeScript to dependencies) |
| `prisma generate` failed | Build must run `npm install` before `npm run build` |
| `P3015` migration file missing | Pull latest GitHub; redeploy |
| `Can't reach database` | Wrong `DATABASE_URL`; use string from Pxxl DB page |
| `JWT_SECRET` / env validation | Add JWT_SECRET 16+ chars |
| `EADDRINUSE` port | Set PORT=4000 on Pxxl |
| Build OK but site 502 | Port on Pxxl must be **4000**, not 3000 |

---

## Step D — Test API after deploy

Replace with your API domain:

```text
https://YOUR-API-DOMAIN.pxxl.click/health
```

Good response:

```json
{"status":"ok","database":"connected"}
```

If `database: unavailable` → `DATABASE_URL` is wrong.

---

## Step E — Frontend (after API works)

Second Pxxl project:

| Field | Value |
|-------|--------|
| Root | `frontend` |
| Port | `3000` |
| Build | `npm install && npm run build` |
| Start | `npm start` |

```env
VITE_API_URL=https://YOUR-API-URL-WITH-NO-TRAILING-SLASH
```

**Redeploy frontend** after setting `VITE_API_URL`.

---

## Step F — Pull latest code

```bash
git pull origin main
```

Then on Pxxl: **Redeploy** or pick latest commit `main`.

Latest fixes include:

- TypeScript in production dependencies (build on Pxxl)
- Server listens on `0.0.0.0`
- `npm run start:deploy` script
- `scripts/start-deploy.sh`

---

## Still stuck?

Send these 3 things:

1. Screenshot of Pxxl settings (Root directory, Port, Build, Start)
2. Last **20 lines** of deploy log (copy text)
3. Your env var **names** only (not passwords): e.g. `DATABASE_URL, JWT_SECRET, PORT`
