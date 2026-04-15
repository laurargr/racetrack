# Info Screens

Real-time racetrack interface system built with Node.js, React, and Socket.IO.

## Launch

1. Clone the repository:
```bash
git clone https://gitea.kood.tech/jessicarossin/info-screens.git
cd info-screens
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` in `/backend` (or copy `.env.example`) and set the interface keys:
```env
RECEPTIONIST_KEY=your_key_here
SAFETY_KEY=your_key_here
OBSERVER_KEY=your_key_here
```

4. Start the backend server:

```bash
cd backend
npm start
```

Development mode with auto-restart:
```bash
npm run dev
```

5. Start the frontend server:

In another terminal run 
```bash
cd frontend\racetrack
npm run dev
```

Server URL:
```text
http://localhost:5173
```


## Interfaces

### Admin Pages

- `/front-desk`
  - Receptionist interface for creating, editing, and deleting queued sessions.
- `/race-control`
  - Safety interface for starting races, changing race mode, and ending the current session.
- `/lap-line-tracker`
  - Observer interface for recording lap crossings for the active session.

### Public Displays

- `/leader-board`
  - Live leaderboard with laps, fastest lap, driver name, timer, and current flag mode.
- `/next-race`
  - Upcoming session display with driver list and paddock notice after a session ends.
- `/race-countdown`
  - Countdown timer display.
- `/race-flags`
  - Simple full-screen flag state display.


## Authentication

- Admin pages require a valid interface key in the auth modal:
  - `/front-desk` -> `RECEPTIONIST_KEY`
  - `/race-control` -> `SAFETY_KEY`
  - `/lap-line-tracker` -> `OBSERVER_KEY`
- Public display pages do not require a key.
- Invalid or mismatched keys are rejected (with a 500ms server delay).

## User Guide

1. Front Desk (Receptionist)
- Open `/front-desk`.
- Add drivers. 
- Create upcoming sessions and add drivers created.
- Edit or delete sessions before they are started.

2. Race Control (Safety Official)
- Open `/race-control`.
- Start the next queued session.
- Change race mode (`safe`, `hazard`, `danger`, `finish`) during the race.
- End the session when finished.

3. Lap-line Tracker (Observer)
- Open `/lap-line-tracker`.
- During an active race, tap a car button each time that car crosses the line.
- Lap counts and fastest lap values are emitted to the leaderboard.

4. Public Displays (Guests / Drivers)
- `/leader-board`: live ranking, laps, fastest lap, current flag mode.
- `/next-race`: upcoming session list and paddock prompt after end.
- `/race-countdown`: remaining race time.
- `/race-flags`: flag-only display for race mode.
