# Info Screens

Real-time racetrack interface system built with Node.js, React, and Socket.IO.

## Requirements

- Node.js 18+
- npm 9+

## Quick Start

1. Clone repository:

```bash
git clone https://gitea.kood.tech/jessicarossin/info-screens.git
cd info-screens
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Create backend environment file:

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Update `.env` with your keys:

```env
receptionist_key=your_key_here
safety_key=your_key_here
observer_key=your_key_here
```

4. Start backend (from `backend`):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

5. Start frontend (in a new terminal):

```bash
# from repository root
cd frontend/racetrack
npm install
npm run dev
```

6. Open frontend URL:

```text
http://localhost:5173
```

Backend Socket.IO server runs on:

```text
http://localhost:3000
```

## Production Access

Live deployment:

- https://racetrack-rho.vercel.app/

Page shortcuts (production):

- Front Desk: https://racetrack-rho.vercel.app/front-desk
- Race Control: https://racetrack-rho.vercel.app/race-control
- Lap-line Tracker: https://racetrack-rho.vercel.app/lap-line-tracker
- Leader Board: https://racetrack-rho.vercel.app/leader-board
- Next Race: https://racetrack-rho.vercel.app/next-race
- Race Countdown: https://racetrack-rho.vercel.app/race-countdown
- Race Flags: https://racetrack-rho.vercel.app/race-flags

## Routes

### Admin Pages

- `/front-desk`: Receptionist interface for creating, editing, and deleting queued sessions.
- `/race-control`: Safety interface for starting races, changing race mode, and ending the current session.
- `/lap-line-tracker`: Observer interface for recording lap crossings for the active session.

### Public Displays

- `/leader-board`: Live leaderboard with laps, fastest lap, driver name, timer, and current flag mode.
- `/next-race`: Upcoming session display with driver list and paddock notice after a session ends.
- `/race-countdown`: Countdown timer display.
- `/race-flags`: Full-screen flag state display.

## Authentication

- Admin pages require a valid interface key in the login modal:
  - `/front-desk` -> `receptionist_key`
  - `/race-control` -> `safety_key`
  - `/lap-line-tracker` -> `observer_key`
- Public pages do not require authentication.
- Invalid or mismatched keys are rejected with a 500 ms server delay.

## User Guide

1. Front Desk (Receptionist)
- Open `/front-desk`.
- Add drivers.
- Create upcoming sessions and assign drivers.
- Edit or delete queued sessions before they start.

2. Race Control (Safety Official)
- Open `/race-control`.
- Start the next queued session.
- Change race mode during the race: `safe`, `hazard`, `danger`, `finish`.
- End the session when finished.

3. Lap-line Tracker (Observer)
- Open `/lap-line-tracker`.
- During an active race, tap a car each time it crosses the line.
- Lap counts and lap times are emitted to the leaderboard.

4. Public Displays (Guests and Drivers)
- `/leader-board`: Live ranking, laps, fastest lap, current flag mode.
- `/next-race`: Upcoming session list and paddock prompt after session end.
- `/race-countdown`: Remaining race time.
- `/race-flags`: Flag-only display for current race mode.

## Notes

- Session duration is 1 minute in development (`npm run dev`) and 10 minutes in production (`npm start`).
- Data is kept in server memory. Restarting backend clears drivers, active sessions, and past sessions.

## Troubleshooting

- Backend exits on startup:
  - Verify `backend/.env` exists and includes all three keys (`receptionist_key`, `safety_key`, `observer_key`).
- Frontend loads but no live updates:
  - Verify backend is running on `http://localhost:3000`.
  - Check browser console and backend terminal for Socket.IO connection errors.
