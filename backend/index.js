require("dotenv").config();
const { time } = require("console");
const { validations, handleAuthentication } = require("./validations");
const fs = require("fs");
const path = require("path");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

validations();
const STATE_FILE_PATH = path.join(__dirname, "state.json");

const getMaxId = (items) => {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((maxId, item) => Math.max(maxId, item?.id || 0), 0);
};

const loadPersistentState = () => {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    return {
      drivers: [],
      sessions: [],
      pastSessions: [],
      driverIdCounter: 0,
      sessionIdCounter: 0,
    };
  }

  try {
    const raw = fs.readFileSync(STATE_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const drivers = Array.isArray(parsed.drivers) ? parsed.drivers : [];
    const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
    const pastSessions = Array.isArray(parsed.pastSessions)
      ? parsed.pastSessions
      : [];

    return {
      drivers,
      sessions,
      pastSessions,
      driverIdCounter: Number.isInteger(parsed.driverIdCounter)
        ? parsed.driverIdCounter
        : getMaxId(drivers),
      sessionIdCounter: Number.isInteger(parsed.sessionIdCounter)
        ? parsed.sessionIdCounter
        : getMaxId([...sessions, ...pastSessions]),
    };
  } catch (error) {
    console.error("failed to load persisted state:", error.message);
    return {
      drivers: [],
      sessions: [],
      pastSessions: [],
      driverIdCounter: 0,
      sessionIdCounter: 0,
    };
  }
};

const initialState = loadPersistentState();

const drivers = initialState.drivers;
const sessions = initialState.sessions;
const pastSessions = initialState.pastSessions;
let driverIdCounter = initialState.driverIdCounter;
let sessionIdCounter = initialState.sessionIdCounter;
const sessionTimeouts = new Map();
const sessionIntervals = new Map();

const SESSION_DURATION_MS =
  process.env.APP_ENV === "development" ||
  process.env.NODE_ENV === "development"
    ? 60 * 1000 // 1 minute on npm run dev
    : 10 * 60 * 1000; // 10 minutes on npm start
const SESSION_TICK_MS = 1000;

const persistState = () => {
  const stateSnapshot = {
    drivers,
    sessions,
    pastSessions,
    driverIdCounter,
    sessionIdCounter,
  };

  const tmpPath = `${STATE_FILE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(stateSnapshot, null, 2), "utf8");
  fs.renameSync(tmpPath, STATE_FILE_PATH);
};

const emitSessions = (io) => {
  if (!io) return;
  io.emit("sessionsList", sessions);
};

const isDriverInRunningSession = (driverId) => {
  return sessions.some(
    (session) =>
      session.status === "running" && session.driverIds.includes(driverId),
  );
};

const stopSessionTimer = (sessionId) => {
  const timeout = sessionTimeouts.get(sessionId);
  if (timeout) {
    clearTimeout(timeout);
    sessionTimeouts.delete(sessionId);
  }

  const interval = sessionIntervals.get(sessionId);
  if (interval) {
    clearInterval(interval);
    sessionIntervals.delete(sessionId);
  }
};

const updateSessionClock = (session) => {
  if (!session.startedAt) {
    session.elapsedSeconds = 0;
    session.remainingSeconds = Math.ceil(SESSION_DURATION_MS / 1000);
    return;
  }

  const elapsedMs = Date.now() - session.startedAt;
  const remainingMs = Math.max(0, SESSION_DURATION_MS - elapsedMs);
  session.elapsedSeconds = Math.floor(elapsedMs / 1000);
  session.remainingSeconds = Math.ceil(remainingMs / 1000);
};

const startSessionTimer = (io, session, options = {}) => {
  const { resume = false } = options;

  stopSessionTimer(session.id);

  if (!resume || !session.startedAt) {
    session.startedAt = Date.now();
  }

  updateSessionClock(session);

  const remainingMs = Math.max(
    0,
    SESSION_DURATION_MS - (Date.now() - session.startedAt),
  );
  if (remainingMs <= 0) {
    endRunningSession(io, session.id, "timeout");
    return;
  }

  const intervalId = setInterval(() => {
    if (session.status !== "running") {
      stopSessionTimer(session.id);
      return;
    }

    updateSessionClock(session);
    io.emit("raceTick", {
      sessionId: session.id,
      elapsedSeconds: session.elapsedSeconds,
      remainingSeconds: session.remainingSeconds,
    });
    emitSessions(io);
  }, SESSION_TICK_MS);

  const timeoutId = setTimeout(() => {
    endRunningSession(io, session.id, "timeout");
  }, remainingMs);

  sessionIntervals.set(session.id, intervalId);
  sessionTimeouts.set(session.id, timeoutId);
};

const endRunningSession = (io, sessionId, reason = "manual") => {
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
  if (sessionIndex === -1) {
    return false;
  }

  const session = sessions[sessionIndex];
  stopSessionTimer(sessionId);
  updateSessionClock(session);
  session.status = "finish";
  session.endReason = reason;
  pastSessions.push(session);
  sessions.splice(sessionIndex, 1);

  persistState();

  if (io) {
    io.emit("pastSessionsList", pastSessions);
    io.emit("sessionNotification", {
      type: "session-ended",
      sessionId,
      reason,
    });
  }
  emitSessions(io);
  return true;
};

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const restoreRuntimeState = () => {
  sessions.forEach((session) => updateSessionClock(session));

  const runningSessions = sessions.filter(
    (session) => session.status === "running",
  );
  runningSessions.forEach((session) => {
    if (session.remainingSeconds <= 0) {
      endRunningSession(null, session.id, "timeout");
      return;
    }
    startSessionTimer(io, session, { resume: true });
  });
};

restoreRuntimeState();

io.use((client, next) => {
  const username = client.handshake.auth.username;
  const token = client.handshake.auth.token;

  const authenticationResponse = handleAuthentication(username, token);

  if (authenticationResponse) {
    next();
  } else {
    console.log("authentication failed for user", username);
    setTimeout(() => {
      next(new Error("invalid access key"));
    }, 500);
  }
});

io.on("connection", (client) => {
  console.log("client connected " + client.id);
  client.emit("driversList", drivers);
  client.emit("sessionsList", sessions);
  client.emit("pastSessionsList", pastSessions);

  client.on("disconnect", () => {
    console.log("client " + client.id + " disconnected");
  });

  client.on("createDriver", (data, callback) => {
    console.log("creating driver with name", data.name);
    const newDriver = {
      id: ++driverIdCounter,
      name: data.name,
    };
    if (drivers.find((d) => d.name === newDriver.name)) {
      callback({ ok: false, message: "driver with this name already exists" });
      return;
    }
    drivers.push(newDriver);
    persistState();
    io.emit("driversList", drivers);
    callback({ ok: true, message: "driver created successfully" });
  });

  client.on("editDriver", (data, callback) => {
    const driver = drivers.find((d) => d.id === data.driverId);
    if (!driver) {
      callback({ ok: false, message: "driver not found" });
      return;
    }
    if (isDriverInRunningSession(data.driverId)) {
      callback({
        ok: false,
        message: "cannot edit a driver assigned to a running session",
      });
      return;
    }
    if (drivers.find((d) => d.name === data.name)) {
      callback({ ok: false, message: "driver with this name already exists" });
      return;
    }
    driver.name = data.name;
    persistState();
    io.emit("driversList", drivers);
    io.emit("sessionsList", sessions);
    callback({ ok: true, message: "driver edited successfully" });
  });

  client.on("deleteDriver", (data, callback) => {
    const driverIndex = drivers.findIndex((d) => d.id === data.driverId);
    if (driverIndex === -1) {
      callback({ ok: false, message: "driver not found" });
      return;
    }
    if (isDriverInRunningSession(data.driverId)) {
      callback({
        ok: false,
        message: "cannot delete a driver assigned to a running session",
      });
      return;
    }

    // also remove the driver from any session they are assigned to
    sessions.forEach((s) => {
      s.driverIds = s.driverIds.filter((id) => id !== data.driverId);
    });

    drivers.splice(driverIndex, 1);
    persistState();
    io.emit("driversList", drivers);
    io.emit("sessionsList", sessions);
    console.log("driver deleted with id", sessions);
    callback({ ok: true, message: "driver deleted successfully" });
  });

  client.on("createSession", () => {
    console.log("creating new session");
    const id = ++sessionIdCounter;
    const newSession = {
      id: id,
      name: "Race #" + id,
      driverIds: [],
    };
    sessions.push(newSession);
    persistState();
    emitSessions(io);
  });
  client.on("assignDriverToSession", (data, callback) => {
    const session = sessions.find((s) => s.id === data.sessionId);
    if (!session) {
      callback({ message: "session not found" });
      return;
    }
    if (session.status === "running") {
      callback({
        ok: false,
        message: "cannot edit drivers for a running session",
      });
      return;
    }

    const rawDriverIds = Array.isArray(data.driverIds)
      ? data.driverIds.slice(0, 8)
      : [];
    const normalizedDriverIds = rawDriverIds.map((id) =>
      Number.isInteger(id) ? id : null,
    );
    const assignedDriverIds = normalizedDriverIds.filter((id) => id !== null);

    // up to 8 is allowed because we only have 8 cars
    if (assignedDriverIds.length > 8) {
      callback({
        ok: false,
        message: "too many drivers for this session, max is 8",
      });
      return;
    }

    if (new Set(assignedDriverIds).size !== assignedDriverIds.length) {
      callback({ ok: false, message: "a driver can only be assigned once" });
      return;
    }

    if (
      assignedDriverIds.some(
        (driverId) => !drivers.some((d) => d.id === driverId),
      )
    ) {
      callback({
        ok: false,
        message: "one or more assigned drivers were not found",
      });
      return;
    }

    session.driverIds = normalizedDriverIds;
    persistState();

    emitSessions(io);
    console.log(sessions);
    callback({ ok: true, message: "drivers assigned to session successfully" });
  });

  client.on("deleteSession", (data) => {
    const sessionIndex = sessions.findIndex((s) => s.id === data.sessionId);
    if (sessionIndex === -1) {
      return;
    }
    stopSessionTimer(data.sessionId);
    sessions.splice(sessionIndex, 1);
    persistState();
    emitSessions(io);
  });

  client.on("startSession", (data, callback) => {
    const session = sessions.find((s) => s.id === data.sessionId);
    if (!session) {
      callback({ message: "session not found" });
      return;
    }
    if (session.status === "running") {
      callback({ ok: false, message: "session already running" });
      return;
    }
    session.status = "running";
    session.mode = "safe"; // default mode
    startSessionTimer(io, session);
    persistState();

    emitSessions(io);
    callback({ ok: true, message: "session started successfully" });
  });

  client.on("endSession", (data, callback) => {
    const ended = endRunningSession(io, data.sessionId, "manual");
    if (!ended) {
      callback({ message: "session not found" });
      return;
    }
    callback({ ok: true, message: "session ended successfully" });
  });

  client.on("setRaceMode", (data, callback) => {
    const session = sessions.find((s) => s.id === data.raceId);
    if (!session) {
      callback({ message: "session not found" });
      return;
    }
    if (session.mode === "finish" && data.mode !== "finish") {
      callback({
        ok: false,
        message: "race mode is locked at finish and cannot be changed",
      });
      return;
    }
    session.mode = data.mode;
    persistState();
    emitSessions(io);
    callback({ ok: true, message: "race mode updated successfully" });
  });

  client.on("recordLap", (data, callback) => {
    const session = sessions.find((s) => s.id === data.raceId);
    if (!session) {
      callback({ message: "session not found" });
      return;
    }
    if (session.status !== "running") {
      callback({ message: "session is not running" });
      return;
    }
    if (!session.driverIds.includes(data.driverId)) {
      callback({ message: "driver not assigned to this session" });
      return;
    }
    if (!session.laps) {
      session.laps = [];
    }
    session.laps.push({
      driverId: data.driverId,
      time: session.elapsedSeconds,
    });
    persistState();
    emitSessions(io);
    callback({ ok: true, message: "lap recorded successfully" });
  });
});

httpServer.listen(3000, () => {
  console.log(
    `server running (${process.env.APP_ENV || process.env.NODE_ENV || "production"} mode, session duration ${Math.floor(
      SESSION_DURATION_MS / 60000,
    )} min)`,
  );
});
