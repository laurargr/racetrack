import React, { useEffect, useRef, useState } from "react";
import { socket } from "../socket.js";
import { Login } from "../components/Login.jsx";
import { Observer } from "../components/Observer.jsx";
import { Box, Typography } from "@mui/material";

const FINISHED_BANNER_MS = 5000;

export function LapLineTracker() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [finishedRaceName, setFinishedRaceName] = useState(null);

  // Keep a ref so the sessionNotification handler can read the latest
  // sessions list before it gets updated by the incoming sessionsList event.
  const sessionsRef = useRef([]);

  useEffect(() => {
    socket.on("connect", () => {
      setLoading(false);
      console.log("Connected to server");
      setConnected(true);
    });
    socket.on("connect_error", () => {
      alert("invalid credentials");
      setLoading(false);
    });
    socket.on("driversList", (data) => {
      setDrivers(data);
    });
    socket.on("sessionsList", (data) => {
      setSessions(data);
      sessionsRef.current = data;
    });
    socket.on("sessionNotification", (data) => {
      if (data.type === "session-ended") {
        const session = sessionsRef.current.find(
          (s) => s.id === data.sessionId,
        );
        setFinishedRaceName(session?.name ?? "Race");
        setTimeout(() => setFinishedRaceName(null), FINISHED_BANNER_MS);
      }
    });
    socket.on("disconnect", () => {
      setConnected(false);
      console.log("disconnected from server");
    });
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("driversList");
      socket.off("sessionsList");
      socket.off("sessionNotification");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  const runningRaceOrNextUp =
    sessions.find((s) => s.status === "running") || sessions[0];

  if (!connected) {
    return (
      <Login
        username="lap-line-observer"
        loading={loading}
        setLoading={setLoading}
      />
    );
  }

  if (finishedRaceName) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: "#111827",
          color: "#f9fafb",
          textAlign: "center",
          p: 4,
        }}
      >
        <Typography variant="h2" fontWeight={700} sx={{ mb: 2 }}>
          Race Finished
        </Typography>
        <Typography variant="h4" color="grey.400">
          {finishedRaceName} has ended
        </Typography>
        <Typography variant="body1" color="grey.500" sx={{ mt: 3 }}>
          Get ready for the next race…
        </Typography>
      </Box>
    );
  }

  return <Observer race={runningRaceOrNextUp} drivers={drivers} />;
}
