# Black Sand Events — Event Planning Platform

The platform of **Black Sand Events & Creations**. More than a booking site: it covers
the full lifecycle of an event, from discovery to the memories shared after it's over.

- WhatsApp: [+234 817 161 7653](https://wa.me/2348171617653) · [+234 707 996 2577](https://wa.me/2347079962577)
- developed by Ajommuo - 08087777476

| Capability | Where it lives |
|---|---|
| **Discover events** | Public `Discover` page — browse upcoming public events by category/city, no account needed |
| **Showcase gallery** | Public `Our Work` page — executed projects grouped under Weddings, Engagements, Surprises, Birthdays, Baby Showers, Corporate; curated by admins |
| **Book vendors** | Vendor marketplace with profiles, portfolios, ratings & reviews, and a request → confirm/decline → complete booking workflow |
| **Plan surprise experiences** | Surprise mode on any event: a secret brief visible only to "insider" guests — never to the honoree |
| **Send gifts** | Per-event gift registry with claiming, plus cash gifts with messages, all through the guest's invite link |
| **Manage guests** | Guest lists with unique invite links, RSVP tracking, plus-ones and dietary notes — guests never need an account |
| **Coordinate payments** | Payment records per event/booking and a live budget summary (budget vs paid vs pending vs vendor commitments vs gifts in) |
| **Track planning progress** | Per-event checklists with category-based starter templates and progress bars everywhere |
| **Communicate with vendors** | A message thread opens automatically with every booking; unread counts, mark-as-read, chat UI |
| **Share memories** | A post-event memory wall of photos and captions per event |

## Architecture

- **Presentation layer** — React 18 SPA (Vite), in `frontend/`
- **Application layer** — Django 5 + Django REST Framework, JWT auth (SimpleJWT), in `backend/`
- **Database layer** — MySQL in production; falls back to SQLite automatically for local development

Three roles drive access control:

- `PLANNER` — hosts: create events, invite guests, book vendors, track budgets
- `VENDOR` — service providers: publish a marketplace profile, manage booking requests, chat with planners
- `ADMIN` — platform operators: user management and platform-wide statistics

Guests are deliberately **not** users: each guest gets a tokenized invite link
(`/rsvp/<token>`) where they can RSVP, read the surprise brief (insiders only),
claim registry items and send gifts with zero friction.

## Running locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data   # optional demo content
python manage.py runserver        # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173 (proxies /api to :8000)
```

### Demo accounts (after `seed_demo_data`, password `Passw0rd!`)

| Username | Role |
|---|---|
| `admin` | Administrator |
| `amara`, `tunde` | Planners |
| `goldleaf`, `lensline`, `djspin`, `bloomz`, `wowmoments` | Vendors |

### MySQL (production)

Copy `backend/.env.example` to `backend/.env`, set `DB_ENGINE=mysql` and the
`DB_*` variables, then run migrations.

## Deploying

The frontend and the API deploy as two separate services. Both build from the production
branch (usually `main`) — set it under Vercel → Settings → Git if you deploy a feature
branch.

A Postgres database is required in production: serverless and container hosts have
read-only or ephemeral filesystems, so SQLite cannot be used there. [Neon](https://neon.tech)
and Render's own Postgres both have free tiers.

### 1. Frontend on Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `event-planning-platform/frontend`. Framework Preset is Vite;
   `frontend/vercel.json` handles the SPA rewrites.
3. Deploy. Add `VITE_API_BASE_URL` once the API is up (step 3 below).

### 2. API on Render

`render.yaml` in this directory is a Render Blueprint — **New → Blueprint** in the Render
dashboard picks it up and configures the service automatically. It sets the build to
`./build.sh` (collectstatic + migrate) and serves with gunicorn. Paste the Postgres
connection string when prompted for `DATABASE_URL`.

To configure it by hand instead: root directory `event-planning-platform/backend`, build
command `./build.sh`, start command `gunicorn epp.wsgi:application`.

Render's free tier sleeps after 15 minutes idle; the first request afterwards takes
roughly 30 seconds while the service wakes.

### 3. Connect them

1. In Vercel, set `VITE_API_BASE_URL` to `https://your-api.onrender.com/api` and redeploy.
2. On the API, set `CORS_ALLOWED_ORIGINS` to your Vercel URL.

### Demo data and the admin account

`SEED_DEMO_DATA=1` populates example planners, vendors, events and gallery items during a
deploy. It creates accounts with the well-known password `Passw0rd!`, including an `admin`
superuser — remove the variable after the first deploy and change that password before
sharing a public link.

### Database configuration

`settings.py` resolves the database in this order: `DATABASE_URL` (or `POSTGRES_URL`) →
`DB_ENGINE=mysql` with the `DB_*` variables → SQLite. Local development needs no
configuration at all.

## API map

```
POST /api/auth/login/                  JWT login (role-aware payload)
POST /api/auth/refresh/                Token refresh
POST /api/accounts/register/           Self-serve signup (planner or vendor)
GET  /api/accounts/me/                 Current profile

GET  /api/events/discover/             Public event discovery (no auth)
GET  /api/events/gallery/              Public project showcase (admin-curated; ?category=WEDDING …)
CRUD /api/events/                      My events (surprise fields, budget, visibility)
CRUD /api/guests/?event=N              Guest list management
GET/POST /api/rsvp/<token>/            Public invite: view + RSVP (no auth)
POST /api/rsvp/<token>/gifts/          Public gift sending / registry claiming

CRUD /api/tasks/?event=N               Planning checklist
POST /api/tasks/seed-defaults/         Category-based starter checklist

GET  /api/vendors/marketplace/         Public vendor marketplace
GET/PUT /api/vendors/me/               Vendor's own profile
CRUD /api/vendors/portfolio/           Vendor portfolio images
CRUD /api/vendors/reviews/             Vendor reviews
CRUD /api/vendors/bookings/            Bookings (planner requests, vendor responds)
POST /api/vendors/bookings/N/set-status/  CONFIRMED / DECLINED / COMPLETED / CANCELLED

GET  /api/messaging/threads/           My conversations (auto-created per booking)
GET/POST /api/messaging/messages/      Chat messages
POST /api/messaging/threads/N/mark-read/

CRUD /api/registry/?event=N            Gift registry
CRUD /api/gifts/?event=N               Gifts received
CRUD /api/payments/?event=N            Payment records
GET  /api/events/N/budget/             Budget summary

CRUD /api/memories/?event=N            Post-event memory wall
GET  /api/reports/dashboard/           Role-aware dashboard stats
```
