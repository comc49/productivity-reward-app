# Productivity Rewards App

Complete tasks → earn coins → spend coins on YouTube watch time.

## Tech Stack

- **Frontend** — Angular 21, NgRx Signals, Apollo Client, Tailwind CSS
- **Backend** — NestJS, GraphQL (Apollo), Prisma 7, PostgreSQL
- **Auth** — Firebase Authentication (Google Sign-In)
- **Monorepo** — Nx
- **Cloud** — Neon for db, Railway for backend, vercel for frontend


---

## Prerequisites

- Node.js 20+
- PostgreSQL (local or remote)
- Firebase project with Google Sign-In enabled
- YouTube Data API v3 key

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example files and fill in your credentials:

```bash
cp .env.example .env
cp client/src/environments/environment.example.ts client/src/environments/environment.ts
```

**`.env`** (backend):
| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Your local/remote Postgres connection string |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate key |
| `FIREBASE_PRIVATE_KEY` | Same service account JSON |
| `YOUTUBE_API_KEY` | Google Cloud Console → APIs → YouTube Data API v3 |

**`client/src/environments/environment.ts`** (frontend):
| Variable | Where to get it |
|---|---|
| `firebase.*` | Firebase Console → Project Settings → Your apps → Web app config |
| `youtubeApiKey` | Same YouTube API key as above |

### 3. Set up the database

```bash
# Create the database (first time only)
createdb productivity_rewards

# Run migrations
npm run db:migrate
```

### 4. Make sure Postgres is running (macOS)

```bash
brew services start postgresql@17
```

---

## Running the app

Open **two terminals**:

**Terminal 1 — API (NestJS on port 3000):**
```bash
npm exec nx serve api
```

**Terminal 2 — Client (Angular on port 4200):**
```bash
npm exec nx serve client
```

Then open [http://localhost:4200](http://localhost:4200).

---

## App structure

```
/                   → Homepage (sign in with Google)
/tasks              → Task list (earn coins by completing tasks)
/rewards            → Rewards shop (spend coins on watch time)
/rewards/videos     → YouTube video search
/rewards/videos/:id → Video player (watch time ticks down while playing)
```

---

## Database scripts

```bash
npm run db:migrate   # Run pending migrations
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:seed      # Seed with sample data
npm run db:studio    # Open Prisma Studio GUI
```

## Build

```bash
npm exec nx build api     # Build API
npm exec nx build client  # Build Angular app
```
