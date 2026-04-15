import { useEffect, useMemo, useState } from "react";
import { socket } from "../socket";
import { Box, Card, Typography } from "@mui/material";

function formatMinSec(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}.${String(remainingSeconds).padStart(2, "0")}`;
}

export function RaceCountdown() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });
    socket.on("connect_error", () => {
      alert("connection failed");
    });
    socket.on("disconnect", () => {
      console.log("disconnected from server");
    });

    socket.on("sessionsList", (data) => {
      setSessions(data);
    });

    socket.auth = { username: "public" };
    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("sessionsList");
      socket.disconnect();
    };
  }, []);

  const runningRaceOrNextUp = useMemo(
    () => sessions.find((s) => s.status === "running") || sessions[0],
    [sessions],
  );

  const remainingSeconds = runningRaceOrNextUp?.remainingSeconds ?? 0;
  const elapsedSeconds = runningRaceOrNextUp?.elapsedSeconds ?? 0;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ background: "#0b1220" }}
    >
      <Card
        variant="outlined"
        sx={{
          width: "min(92vw, 720px)",
          p: 5,
          borderRadius: 3,
          textAlign: "center",
          background: "#111827",
          borderColor: "#1f2937",
          color: "#f9fafb",
        }}
      >
        <Typography variant="h5" sx={{ mb: 1 }}>
          {runningRaceOrNextUp ? runningRaceOrNextUp.name : "No race running"}
        </Typography>

        <Typography
          variant="h1"
          sx={{ fontSize: { xs: 80, sm: 140 }, lineHeight: 1, fontWeight: 700 }}
        >
          {formatMinSec(remainingSeconds)}
        </Typography>

        {runningRaceOrNextUp?.status === "running" && (
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Elapsed: {formatMinSec(elapsedSeconds)}
          </Typography>
        )}
      </Card>
    </Box>
  );
}
