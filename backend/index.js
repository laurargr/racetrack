require("dotenv").config();
const { time } = require("console");
const { validations, handleAuthentication } = require("./validations");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

validations();
const drivers = [];
const sessions = [];
const pastSessions = [];
const sessionTimeouts = new Map();
const sessionIntervals = new Map();

const SESSION_DURATION_MS =
  process.env.APP_ENV === "development" ||
  process.env.NODE_ENV === "development"
    ? 60 * 1000 // 1 minute on npm run dev
    : 10 * 60 * 1000; // 10 minutes on npm start
const SESSION_TICK_MS = 1000;

const emitSessions = (io) => {
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

const startSessionTimer = (io, session) => {
  stopSessionTimer(session.id);

  session.startedAt = Date.now();
  updateSessionClock(session);

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
  }, SESSION_DURATION_MS);

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

  io.emit("pastSessionsList", pastSessions);
  io.emit("sessionNotification", {
    type: "session-ended",
    sessionId,
    reason,
  });
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

io.use((client, next) => {
  const username = client.handshake.auth.username;
  const token = client.handshake.auth.token;

  const authenticationResponse = handleAuthentication(username, token);

  if (authenticationResponse) {
    next();
  } else {
    console.log("authentication falied for user", username);
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
      id: drivers.length + 1,
      name: data.name,
    };
    if (drivers.find((d) => d.name === newDriver.name)) {
      callback({ ok: false, message: "driver with this name already exists" });
      return;
    }
    drivers.push(newDriver);
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
    io.emit("driversList", drivers);
    io.emit("sessionsList", sessions);
    console.log("driver deleted with id", sessions);
    callback({ ok: true, message: "driver deleted successfully" });
  });

  client.on("createSession", () => {
    console.log("creating new session");
    const id = sessions.length > 0 ? sessions[sessions.length - 1].id + 1 : 1;
    const newSession = {
      id: id,
      name: "Race #" + id,
      driverIds: [],
    };
    sessions.push(newSession);
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

    // up to 8 is alowed because we have only 8 cars, and each driver needs a car
    if (data.driverIds.length > 8) {
      callback({
        ok: false,
        message: "too many drivers for this session, max is 8",
      });
      return;
    }
    session.driverIds = data.driverIds;

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
    session.mode = data.mode;
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
