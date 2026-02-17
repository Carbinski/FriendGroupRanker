# Friend Group Ranker

A real-time web app that lets friend groups track engagement through map-based clock-ins and a competitive leaderboard.

## Features

- **Email/Password Auth** — Sign up and log in; sessions persist across refreshes via HTTP-only JWT cookies.
- **Interactive Map** — Dark-themed Google Map centered on Atlanta with Places search.
- **Clock-In System** — Users clock in at their location; a pin appears on the map for 1 hour 30 minutes.
- **Points & Bonus Zones** — Earn base points per clock-in, bonus points inside designated zones, and extra points when nearby friends are also clocked in.
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
| Base clock-in | +10 |
| Inside a bonus zone | +50 |
| 1 nearby user (within 100 m) | +5 |
| 2 nearby users | +15 |
| 3+ nearby users | +30 |

## Adding Bonus Zones

Edit `src/lib/bonus-zones.ts` and add entries to the `BONUS_ZONES` array:

```ts
{
  id: "zone-2",
  name: "Coffee Shop",
  bounds: { north: 33.778, south: 33.776, east: -84.394, west: -84.396 },
  points: 50,
}
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & register pages
│   ├── (dashboard)/      # Main map page (protected)
│   └── api/
│       ├── auth/         # register, login, me, logout
│       ├── clockin/      # GET active pins, POST new clock-in
│       └── leaderboard/  # GET leaderboard with time range
├── components/
│   ├── dashboard/        # ClockInButton, Leaderboard
│   ├── map/              # GoogleMap wrapper
│   ├── providers/        # AuthProvider context
│   └── ui/               # shadcn components
├── hooks/                # useActiveClockIns, useLeaderboard
├── lib/                  # db, auth, points, bonus-zones, constants
└── types/                # TypeScript interfaces
```

## Future Improvements

- Multiple friend groups with invite links
- Real-time updates via WebSockets (Pusher/Ably)
- Per-group leaderboards
- Push notifications when friends clock in nearby
- Profile pages and avatars
