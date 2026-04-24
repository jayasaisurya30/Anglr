# ANGLR — Startup (every day)

Quick reference for running the app after [SETUP.md](./SETUP.md) is complete.

---

## Development server

From the project root (with `NEXT_PUBLIC_*` and Supabase variables configured):

```bash
npm run dev
```

- **App URL:** [http://localhost:3000](http://localhost:3000)
- **Landing:** `/`  
- **Sign in / sign up:** `/login`, `/signup`  
- **Dashboard (after auth):** `/map`, `/catches`, `/stats`, `/friends`, `/profile`, `/settings`  
- **Public:** `/public/feed`, `/public/map`

Turbopack is used in dev (see `package.json`); change port if 3000 is in use, for example:

```bash
npx next dev -p 3001
```

If you use a non-default port, set `NEXT_PUBLIC_SITE_URL` and Supabase redirect URLs to match.

---

## Common scripts

| Command | When to use |
| -------- | ------------ |
| `npm run dev` | Local development with hot reload |
| `npm run build` | Production build (run before deploy) |
| `npm run start` | Run production build locally (after `build`) |
| `npm run lint` | ESLint (if configured) |

---

## When something fails

- **“Invalid API key” / Supabase errors** — Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` match the project in the Supabase dashboard.
- **Blank map or Mapbox errors** — Confirm `NEXT_PUBLIC_MAPBOX_TOKEN` is set and not expired; check the browser console.
- **OAuth redirect errors** — Ensure `https://<your-site>/auth/callback` (and `http://localhost:3000/auth/callback` for local) is listed in Supabase **Redirect URLs**.
- **RLS or “permission denied”** — Re-run or verify [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) on the same project you are pointing to.

For full troubleshooting and project details, see [README.md](./README.md).
