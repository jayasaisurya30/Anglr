# ANGLR

A premium fishing tracker. Log catches on a live map, review your stats, and share with friends. Desktop-first, dark-only, built for anglers who love the craft.

Built with **Next.js 15 · TypeScript · Tailwind v3 · shadcn/ui primitives · Framer Motion · Supabase · Mapbox**.

---

## Features

- **Landing page** with animated Apple/Tesla-style hero and app mockup.
- **Auth** — email/password + Google OAuth, signup collects unique `username` & `@handle`, forgot/reset password flows, middleware-refreshed session.
- **Sidebar dashboard** with Map, My Catches, Stats, Friends, Profile, Settings.
- **Live Mapbox map** with dark style + boosted water layers, live geolocation marker with glow, fish-shaped catch pins that fade with age, and `supercluster` clustering.
- **Add catch** with auto-GPS or click-to-place, multi-image upload direct to Supabase Storage, visibility toggles (private / friends / public).
- **My Catches** — premium gallery grid with search and filters (species, date, weight, visibility), modal for view/edit/delete with React Query mutations.
- **Stats** — KPI cards, monthly catches area chart, species pie, personal Mapbox heatmap of your spots.
- **Friends** — Discover / Requests / Followers / Following with search, follow-request flow, and instagram-like `FollowButton` states.
- **Public surfaces** — `/public/feed` with likes/comments and `/public/map` with all public catches.
- **Profile page** at `/profile/[handle]` with counts, biggest fish, and recent catches.
- **Settings** — profile, global "share private map" toggle, notification prefs, sign out.
- **Notifications bell** with Supabase Realtime; sonner toasts on new events.
- **Offline queue** (IndexedDB via `idb`): catches submitted offline are queued and auto-synced on reconnect.

---

## Tech stack

| Area       | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 15 (App Router, React 19)                  |
| Language   | TypeScript (strict)                                |
| Styling    | Tailwind CSS v3 + custom dark theme + Radix primitives |
| UI         | Custom shadcn-style components in `components/ui/` |
| Motion     | Framer Motion                                      |
| Data cache | `@tanstack/react-query`                            |
| Forms      | `react-hook-form` + `zod`                          |
| Auth + DB  | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Maps       | Mapbox GL JS + `react-map-gl` v7 + `supercluster`  |
| Charts     | `recharts`                                         |
| Offline    | `idb` (IndexedDB)                                  |
| Toasts     | `sonner`                                           |

---

## Getting started

### 1. Install dependencies

```bash
npm install
# or pnpm install / yarn
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy the `URL`, `anon` key, and `service_role` key.
3. Open the **SQL Editor**, paste the contents of [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql), and run it. This creates all tables, RLS policies, triggers, and the `catch-images` storage bucket.
4. Under **Authentication → Providers**, enable **Email** and **Google**.
   - For Google: follow the [Supabase guide](https://supabase.com/docs/guides/auth/social-login/auth-google) to add OAuth credentials.
   - In **Redirect URLs**, add `http://localhost:3000/auth/callback` (and your production URL later).

### 3. Create a Mapbox token

1. Sign up / log in at [account.mapbox.com](https://account.mapbox.com).
2. Go to **Access tokens** and either use the default public token or create a new one restricted to your local URL.

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...              # optional, server-only
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
  (auth)/                # login, signup, forgot/reset password
  (app)/                 # authenticated dashboard (map, catches, stats, friends, profile, settings)
  auth/callback/         # OAuth / email confirm callback
  auth/signout/          # POST route to end session
  public/feed            # public social feed
  public/map             # public catches map
  page.tsx               # landing
  layout.tsx, globals.css

components/
  ui/                    # shadcn-style primitives (button, input, dialog, etc.)
  common/                # GlassCard, PageHeader, motion wrappers, skeletons, logo, offline badge
  layout/                # Sidebar, TopBar, UserMenu, NotificationsPopover
  landing/               # Hero, AppMockup, Features, CTA, Footer, Nav
  auth/                  # AuthShell, OAuth buttons
  map/                   # MapCanvas, CatchPin, ClusterMarker, UserLocationMarker, AddCatchSheet
  catches/               # CatchCard, CatchForm, CatchModal, CatchFilters, ImageUploader
  stats/                 # StatCard, MonthlyCatches, SpeciesPie, PersonalHeatmap
  friends/               # UserRow, FollowButton
  feed/                  # FeedItem, LikeButton, CommentThread

lib/
  supabase/              # client.ts, server.ts, middleware.ts, types.ts
  mapbox/                # style.ts, cluster.ts
  offline/               # db.ts, queue.ts, use-sync-online.ts
  queries/               # catches.ts, follows.ts, social.ts, stats.ts
  validators/            # auth.ts, catch.ts
  utils/                 # cn, dates, fade-color

hooks/                   # use-user, use-geolocation, use-debounce, use-realtime-notifications

supabase/migrations/     # 0001_init.sql (schema, RLS, storage)
middleware.ts            # refresh Supabase session + route gating
```

---

## Design system

- Near-black background `#08090B`, panel `#0E1014`, subtle glass borders `rgba(255,255,255,0.06)`.
- ANGLR accent blue `#4DA3FF` with soft glow and `pulseGlow` animation.
- Rounded-2xl default, rounded-3xl for cards.
- Motion curve `cubic-bezier(0.2, 0.8, 0.2, 1)`, 200–400ms transitions, staggered lists.
- Skeleton shimmer on every async surface.

Open `app/globals.css` and `tailwind.config.ts` to tune palette, radii, and motion.

---

## Security model (RLS summary)

- **Everyone** can read public profiles.
- **Catches** are readable when public OR owned OR (friends and mutual follow exists).
- **Owners** fully CRUD their own rows.
- **Storage**: anyone can read the `catch-images` bucket (public URLs); authenticated users can only upload into their own `auth.uid()` folder.
- **Follow requests**: from/to users see their rows; recipient updates status; trigger creates mutual follow rows on accept.
- **Notifications**: triggers insert into `notifications` on like/comment/follow_request/accept; Realtime publication added.

All policies live in `supabase/migrations/0001_init.sql`.

---

## Offline flow

1. User submits a catch while offline → the form calls `queueCatch()` (writes to IndexedDB `queued_catches` store) and shows a "Queued" toast.
2. The `OfflineSyncer` component (mounted in the app layout) uses `useSyncOnline()` to listen for the `online` event.
3. On reconnect it replays each queued entry via `createCatch`, removing successful rows from the store and invalidating React Query caches.

---

## Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the dev server                     |
| `npm run build`    | Production build                         |
| `npm run start`    | Run the built app                        |
| `npm run lint`     | Next.js ESLint                           |
| `npm run typecheck`| `tsc --noEmit`                           |

---

## Deployment

- **Vercel** works out of the box. Set the same environment variables in the project.
- Update Supabase **Auth → URL Configuration → Redirect URLs** to include `https://YOUR-DOMAIN/auth/callback`.
- If you want to regenerate database types after schema changes, run `supabase gen types typescript --project-id YOUR-PROJECT-ID` and replace the contents of `lib/supabase/types.ts`.

---

## Roadmap ideas

- Web push notifications on top of Realtime events.
- Trip grouping (bundle catches into a single outing).
- Gear locker (log rods, reels, lines per catch).
- Share any catch as an open-graph image.
- Collaborative private maps for fishing clubs.
