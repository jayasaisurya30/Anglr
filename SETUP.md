# ANGLR — Setup (first time)

One-time or rare steps to get the app ready on your machine. For daily commands after setup, see [STARTUP.md](./STARTUP.md). For features and architecture, see [README.md](./README.md).

---

## Prerequisites

- **Node.js** 20 LTS (or 18+) — [nodejs.org](https://nodejs.org)
- **npm**, **pnpm**, or **yarn** (examples below use `npm`)
- A **Supabase** account and project
- A **Mapbox** account and access token

---

## 1. Install dependencies

From the project root:

```bash
npm install
```

---

## 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy:
   - **Project URL**
   - **anon** `public` key
   - **service_role** key (server-only; keep out of the browser and git)

### Database and storage

1. Open the **SQL Editor** in the Supabase dashboard.
2. Paste the full contents of [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) and run it.

This creates tables, RLS, triggers, and the `catch-images` storage configuration referenced by the app.

### Authentication

1. In **Authentication → Providers**, enable **Email** and **Google** (if you want Google sign-in).
2. For Google, follow [Supabase: Google](https://supabase.com/docs/guides/auth/social-login/auth-google) to configure OAuth in Google Cloud and Supabase.
3. Under **URL Configuration** / **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - Your production app URL with `/auth/callback` when you deploy.

---

## 3. Mapbox

1. Sign in at [account.mapbox.com](https://account.mapbox.com).
2. Open **Access tokens** and copy a **public** token (or create one scoped to your domains).

Maps use this token in the browser via `NEXT_PUBLIC_MAPBOX_TOKEN`.

---

## 4. Environment variables

1. Copy the example file (do not commit real secrets):

   ```bash
   cp .env.example .env.local
   ```

2. Edit **`.env.local`** (or `.env` if you prefer) and set:

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (safe in client bundle) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (optional; for server actions that need elevated access) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token |
| `NEXT_PUBLIC_SITE_URL` | Base URL, e.g. `http://localhost:3000` for local dev |

- Never commit `.env` / `.env.local` with real keys.
- Ensure `.env*` with secrets is listed in [`.gitignore`](./.gitignore).

---

## 5. Verify

After configuration:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the landing page; sign up or log in to reach the app shell.

For ongoing usage, see [STARTUP.md](./STARTUP.md).

---

## Optional: production checklist

- Set production `NEXT_PUBLIC_SITE_URL` and **Supabase** redirect URL for your domain.
- Restrict Mapbox token URLs to your production domain.
- Run through signup, OAuth, map load, and image upload in staging.
