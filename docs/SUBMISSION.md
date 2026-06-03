# StockGuard — submission checklist

Use this before you send the project to recruiters.

## Links to fill in

Edit `README.md` at the top and replace:

```markdown
| Live demo (required) | https://YOUR-APP.pxxl.app |
| Loom walkthrough (required) | https://www.loom.com/share/YOUR_VIDEO_ID |
```

## Done in the repo

- [x] Backend: reserve, checkout, expiry, concurrency-safe stock
- [x] Frontend: limited drop page, 5s stock refresh, countdown, payment methods
- [x] Docker Compose for local demo
- [x] Tests (backend + frontend)
- [x] README: race conditions, schema, trade-offs, scaling

## You must complete

- [ ] Deploy live app on **Pxxl** ([pxxl.app](https://pxxl.app/))
- [ ] Record **Loom** video (5–8 minutes)
- [ ] Paste **live URL** + **Loom URL** in `README.md`
- [ ] Push README to GitHub
- [ ] Submit: GitHub + Pxxl URL + Loom URL

## Optional (not required by brief)

- [ ] Host frontend on Vercel (API must still be hosted elsewhere)
- [ ] Add hand-drawn or exported architecture PNG in `docs/`

## Quick local demo before recording Loom

```bash
docker compose up --build
```

- UI: http://localhost:5173  
- API health: http://localhost:4000/health  

Flow: Reserve → countdown → pick payment → fill form → Pay now.
