# Zombie App

A Halloween-themed assistive web app for a zombie character with "brain fog." It has a dashboard with three features: a Lost button, a Next Up routine card, and a Who Is This? face-recognition camera. This is a short team project (hackathon-style), so prefer simple, working solutions over polish. Do not add features that are not listed here.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (React, App Router) + Tailwind CSS, TypeScript |
| Face recognition | `@vladmandic/face-api`, runs in the browser |
| Backend | FastAPI + SQLAlchemy (or SQLModel) |
| Database | SQLite (single file, `zombie.db`), no Docker |
| Live alerts | FastAPI WebSockets + browser Notification API, plus an email to the caregiver (Python `smtplib`, no extra package) |

## Repo layout

```
zombie-app/
├── CLAUDE.md
├── .gitignore                # includes .env, .env.local, zombie.db, node_modules, __pycache__
├── frontend/
│   ├── .env.local            # NEXT_PUBLIC_API_URL=http://localhost:8000
│   ├── public/models/        # face-api model files
│   └── src/
│       ├── app/              # pages: dashboard, routine, caregiver
│       ├── components/       # LostButton, LostModal, NextUpCard, FaceCamera, ...
│       └── lib/
│           ├── api.ts        # all fetch calls to the backend
│           └── socket.ts     # WebSocket client for the caregiver page
└── backend/
    ├── .env                  # DATABASE_URL=sqlite:///./zombie.db (not committed)
    ├── .env.example          # same keys, no secrets (committed)
    ├── requirements.txt
    ├── seed.py               # creates tables and inserts demo data
    └── app/
        ├── main.py           # app, CORS, create_all, router includes
        ├── config.py         # loads .env with pydantic-settings
        ├── db.py             # engine and session
        ├── models.py
        ├── schemas.py
        ├── ws_manager.py     # WebSocket connection manager
        └── routers/          # profile.py, routine.py, people.py, alerts.py
```

## Features

### 1. "I'm Lost" button (Lost Mode)
- Big, red, pinned at the top of the dashboard, easy to hit in a panic.
- Tapping it opens a modal showing home address, emergency contact, and familiar places.
- It also calls `POST /lost`, which saves an alert and broadcasts it to the caregiver over WebSocket.
- Location: the dashboard asks for location permission on load. On press, the modal opens first; then the browser Geolocation API gets a fix (gives up after about 8 s) and `POST /lost` is sent with `{ lat, lng, accuracy }`, or with no body if there is no location. No map library or API key: the email contains plain Google Maps and Apple Maps links.
- `POST /lost` also emails the caregiver (`CAREGIVER_EMAIL`) as a background task after responding. SMTP settings live in `backend/.env`; if they are empty, email is skipped. Email failures are logged, never returned to the frontend.
- Cache profile and places data in `localStorage` after the first load, so the modal appears instantly and still works if the backend is down. If `POST /lost` fails, fail quietly and retry; never block the modal on the network.

### 2. Next Up card
- Shows the current step of today's routine, for example "3:00 PM, take your medicine", with a checkmark to mark it done.
- "See full day" opens the whole checklist page.
- Fetch all steps once. The frontend picks the first not-done step at or after the current time. There is no separate "next" endpoint.

### 3. Who Is This? camera
- A button opens the camera (`getUserMedia`) and shows the matched person's name and relationship.
- Matching runs in the browser with face-api. Each person's 128-d descriptor is stored in the database; the frontend fetches all people on load and uses `FaceMatcher` with a distance threshold of about 0.5 to 0.6.
- Support enrolling a person: capture 2 to 3 photos, average or store their descriptors, and save via `POST /people`.
- face-api must load on the client only: `dynamic(() => import(...), { ssr: false })`. Model files live in `frontend/public/models`. If the bundler complains about Node modules such as `fs`, add a webpack fallback in `next.config.js`.

### Caregiver page
- Connects to `WS /ws/caregiver`. On load it also fetches recent alerts from `GET /alerts`, so a missed WebSocket message is not lost.
- On a new alert: show an in-page banner with the time, play a sound, and fire a browser Notification.

## Database tables

| Table | Columns |
|---|---|
| `profile` | id, name, home_address, emergency_contact_name, emergency_contact_phone |
| `places` | id, name, address |
| `routine_steps` | id, time (HH:MM), task, done (bool) |
| `people` | id, name, relationship, descriptor (JSON list of 128 floats) |
| `alerts` | id, created_at, lat, lng, accuracy (meters); the last three are nullable |

There is no login. Use a single hard-coded user and caregiver for the demo. `seed.py` creates the tables and inserts the demo data.

## API contract

Base URL: `http://localhost:8000`. All bodies are JSON. Frontend devs can mock these before the backend is ready.

| Method | Path | Request body | Response |
|---|---|---|---|
| GET | `/profile` | | `{ id, name, home_address, emergency_contact_name, emergency_contact_phone }` |
| GET | `/places` | | `[{ id, name, address }]` |
| GET | `/routine` | | `[{ id, time, task, done }]` sorted by time |
| PATCH | `/routine/{id}` | `{ done: boolean }` | the updated step |
| GET | `/people` | | `[{ id, name, relationship, descriptor }]` |
| POST | `/people` | `{ name, relationship, descriptor }` | the created person |
| POST | `/lost` | optional `{ lat, lng, accuracy }` | the created alert `{ id, created_at, lat, lng, accuracy }`; also broadcasts it and emails the caregiver |
| GET | `/alerts` | | recent alerts `[{ id, created_at, lat, lng, accuracy }]`, newest first (limit 20) |
| WS | `/ws/caregiver` | | pushes `{ type: "lost", alert: { id, created_at, lat, lng, accuracy } }` |

If you change the contract, update this file in the same commit.

## Conventions

- Backend: Python 3.11+, type hints, Pydantic schemas in `schemas.py`, one router file per resource. SQLite needs `connect_args={"check_same_thread": False}` on the engine. CORS must allow `http://localhost:3000`.
- Frontend: TypeScript, function components, Tailwind for all styling, no CSS files beyond the Tailwind import. All backend calls go through `lib/api.ts`.
- Design: mobile-first, large touch targets (at least 48px), large text, high contrast. The Lost button must be the most prominent element.
- Theme: playful zombie tone in copy and seed data, but the UI must stay clear and calm.
- Do not commit `.env`, `.env.local`, or `zombie.db`. Keep `.env.example` up to date.
- No new dependencies without telling the team. Keep it simple.

## Running locally

```
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python seed.py
uvicorn app.main:app --reload --port 8000

# frontend
cd frontend
npm install
npm run dev        # http://localhost:3000
```

The camera requires `localhost` or HTTPS. For a phone demo, expose the frontend through an HTTPS tunnel (ngrok or Cloudflare Tunnel).

## Team ownership

| Role | Owns |
|---|---|
| Frontend dev | Dashboard layout, Lost Mode modal, routine page, caregiver page UI, styling and mobile responsiveness |
| Backend dev A | Models, seed script, profile/places/routine/people routes, keeping the API contract accurate |
| Backend dev B | `POST /lost`, WebSocket manager, caregiver broadcast and email alert, demo script, seed content, pitch deck |
| Full stack | face-api integration (models, enrollment, matching loop, saving descriptors), `api.ts` and `socket.ts` wiring, browser notifications, integration testing |

Stay in your own area to avoid merge conflicts, and merge often.

## Build order

1. Hour 0 to 1: confirm this contract and the table schema, create the repo, get the backend running with seed data.
2. Everyone builds in parallel; start face-api first, since it is the riskiest.
3. Midpoint: integrate end to end, starting with the Lost button (press, API, WebSocket, caregiver screen).
4. Last 1 to 2 hours: freeze features, polish, rehearse the 2-minute demo.

## Known limits (for the demo and pitch)

- No authentication; one hard-coded user.
- The alert carries a one-time location snapshot from the browser, not live tracking. It is missing if permission is denied or no fix arrives within about 8 s, and laptop locations (Wi-Fi based) can be off by tens of meters or more. Location is sensitive data and is stored unencrypted in the demo.
- Browser notifications only work while the caregiver page is open (and on iPhone only if installed to the home screen).
- Face descriptors are sensitive data. They are stored unencrypted in the demo; a real version would need consent, encryption, and access control.
- This is a demo, not a safety device. It does not replace real emergency tools.
