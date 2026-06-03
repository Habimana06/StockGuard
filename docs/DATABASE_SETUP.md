# MySQL for StockGuard — Pxxl failed? Use Plan B

If **Create Database** fails on Pxxl, the API can use MySQL hosted **anywhere**. You only need a `DATABASE_URL` string.

---

## Why Pxxl database creation might fail

| Cause | What to try |
|-------|-------------|
| **Free plan limit** | You may only get 1 database — delete an old test DB first |
| **Name already used** | Try a unique name: `stockguard-habimana` or `sgdb2026` |
| **Server busy** | Wait 10 minutes and try again, or use Plan B below |
| **Account not verified** | Check email verification on Pxxl |
| **Backups (Pro)** | Keep **Daily encrypted backups** **unchecked** (you did this correctly) |

Your settings in the screenshot look **correct**:

- Name: `stockguard-db`
- Type: **MySQL**
- Server: `db.pxxl.pro`

If it still fails, **do not block the project** — use an external free MySQL (Plan B).

---

## Plan A — Retry on Pxxl

1. Dashboard → **Databases** → delete any broken / stuck databases.
2. Create again with name: `sg-habimana-01` (unique).
3. Type: **MySQL**, backups: **off**.
4. Click **Create Database**.
5. When it works, open the DB → copy **Connection string** / **DATABASE_URL**.

Format should look like:

```text
mysql://USER:PASSWORD@HOST:3306/DATABASE
```

---

## Plan B — Free MySQL outside Pxxl (recommended if Plan A fails)

### Option 1: Railway (easy)

1. Go to [railway.app](https://railway.app/) → sign in with GitHub.
2. **New project** → **Provision MySQL**.
3. Click MySQL service → **Connect** → copy **MySQL URL** (public).
4. Use that as `DATABASE_URL` on your **Pxxl backend** project.

### Option 2: TiDB Cloud (free tier)

1. [tidbcloud.com](https://tidbcloud.com/) → free cluster.
2. MySQL-compatible connection string → use as `DATABASE_URL`.

### Option 3: Aiven (free trial)

1. [aiven.io](https://aiven.io/) → MySQL free trial.
2. Copy service URI → `DATABASE_URL`.

### Option 4: Local MySQL + tunnel (last resort for demo)

Only if you must show something today:

- Run `docker compose up mysql -d` on your PC.
- Use [ngrok](https://ngrok.com/) to expose port 3307 (not ideal for production).

---

## After you have DATABASE_URL

Put it on **Pxxl backend** project (Root: `backend`, Port: `4000`):

```env
DATABASE_URL=mysql://user:pass@host:3306/dbname
JWT_SECRET=your-long-secret-min-16-chars
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://stockguard.pxxl.click
RESERVATION_TTL_MINUTES=5
```

Redeploy backend → test: `https://YOUR-API-URL/health`

---

## For the internship submission

The test asks for **Pxxl hosted app** — that means **frontend + API on Pxxl**.  
The database **does not have to be on Pxxl** if their DB product fails. External MySQL + Pxxl API is acceptable for a working demo.

Mention in README if needed:

> MySQL hosted on Railway; API and frontend on Pxxl.
