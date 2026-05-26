# School Scheduler (Week A/B)

Full-stack Node.js + Express + SQLite app for managing school timetables with a **2-week rotating schedule** (Week A / Week B).

## Tech
- Backend: Node.js + Express
- DB: SQLite via `better-sqlite3`
- Auth: JWT (`jsonwebtoken`) + password hashing (`bcrypt`)
- Frontend: Vanilla HTML/CSS/JS (served by Express), mobile-first responsive UI

## Setup

1) Install dependencies:

```bash
cd school-scheduler
npm install
```

2) Create your `.env`:

```bash
copy .env.example .env
```

Edit `.env` and set `JWT_SECRET`.

3) Run:

```bash
npm start
```

App runs at `http://localhost:3000` (or `PORT` from `.env`).

## Seeded accounts (first run)
- Admin: `admin` / `admin123`
- Student: `student7a` / `student123`

## Notes
- The database file is created at `school-scheduler/data.sqlite`.
- Week A/B is calculated from the configured **Week A start date** (Admin → Week config).

