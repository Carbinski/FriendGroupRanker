# Friend Group Ranker

A real-time web app that lets friend groups track engagement through map-based clock-ins and a competitive leaderboard.

## Features

- **Email/Password Auth** — Sign up and log in; sessions persist across refreshes via HTTP-only JWT cookies.
- **Interactive Map** — Dark-themed Google Map centered on Atlanta with Places search.
- **Clock-In System** — Users clock in at their location; a pin appears on the map for 1 hour 30 minutes.
- **Points & Zones** — Earn base points per clock-in; bonus zones award configurable extra points (with optional active hours); red zones always give 0 points when you clock in inside them (optional active hours). Zones are stored in the database and managed by admins.
- **Admin Zone Management** — Admins can create, edit, and delete bonus and red zones via the map’s drawing tools (user chip → “Manage zones”) or the zones API.
- **Leaderboard** — Global leaderboard with All Time / Month / Week filters.
- **Polling** — Map pins refresh every 12 seconds so you can see when friends arrive.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Map | Google Maps JavaScript API + Places |
| Database | MongoDB Atlas (free tier) |
| Auth | bcryptjs + jose (JWT) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster ([free tier guide](https://www.mongodb.com/docs/atlas/getting-started/))
- A Google Maps API key with **Maps JavaScript API** and **Places API** enabled

### 1. Clone & Install

```bash
git clone <repo-url>
cd FriendGroupRanker
npm install
```

### 2. Configure Environment

Copy the example env and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_DB_NAME` | Database name (default: `friend-group-ranker`) |
| `JWT_SECRET` | Random secret for signing tokens (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

### 4. Deploy to Vercel

```bash
npx vercel
```

Add the same environment variables in Vercel's project settings.

## Points System

| Action | Points |
|--------|--------|
| Base clock-in | +5 |
| Inside a bonus zone | Set per zone by admin (e.g. +50) |
| 1+ nearby users (within 400 m) | +15 (proximity bonus) |

## Zones (Bonus & Red)

Zones are stored in MongoDB and can have optional **active hours** (local time); when set, the zone only applies during that window.

- **Bonus zones** — Award extra points when you clock in inside them. The points value is **configurable per zone** (set by the admin when creating the zone). If the zone has active hours, bonus points are only awarded when the clock-in falls within that time range.
- **Red zones** — Clocking in inside a red zone **always awards 0 points** (no base, no bonus, no proximity). The pin still appears on the map. If the zone has active hours, points are only zeroed when the clock-in falls within that window; outside those hours the clock-in is treated as normal.

- **Via UI**: Sign in as an admin, click your user chip in the top bar → “Manage zones”, then use the toolbar to draw and edit polygons.
- **Via API**: `GET /api/zones` (auth), `POST /api/admin/zones` (admin), `DELETE /api/admin/zones/[id]` (admin).
- **First admin**: Set `isAdmin: true` on your user document in MongoDB (e.g. Atlas UI) to enable the admin UI and API.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & register pages
│   ├── (dashboard)/      # Main map page (protected)
│   └── api/
│       ├── auth/         # register, login, me, logout
│       ├── admin/zones/  # POST create zone, DELETE zone (admin only)
│       ├── clockin/      # GET active pins, POST new clock-in
│       ├── leaderboard/  # GET leaderboard with time range
│       └── zones/        # GET all zones (auth required)
├── components/
│   ├── admin/            # Zone form modal, admin toolbar
│   ├── dashboard/        # ClockInButton, Leaderboard, user chip
│   ├── map/              # GoogleMap wrapper
│   ├── providers/        # AuthProvider context
│   └── ui/               # shadcn components
├── hooks/                # useActiveClockIns, useLeaderboard
├── lib/                  # db, auth, points, zone-service, zone-utils, admin, constants
└── types/                # TypeScript interfaces
```

## Testing

Tests use **Vitest** and **mongodb-memory-server** for integration tests. Run:

```bash
npm run test
```

The first run may download MongoDB binaries (cached in `.cache/mongodb-binaries`). If you see `Md5CheckFailedError`, remove that directory and run again. Key test files: `src/__tests__/zone-service.test.ts`, `src/__tests__/admin-auth.test.ts`, `src/__tests__/zone-api.test.ts`, `src/__tests__/clockin-zones.test.ts`.

## Future Improvements

- Multiple friend groups with invite links
- Real-time updates via WebSockets (Pusher/Ably)
- Per-group leaderboards
- Push notifications when friends clock in nearby
- Profile pages and avatars
