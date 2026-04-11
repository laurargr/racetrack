import { useEffect, useMemo, useState } from "react";
import { Box, Card, Typography } from "@mui/material";
import { socket } from "../socket";

export function NextRace() {
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

  const nextRace = useMemo(() => {
    if (!sessions.length) return undefined;

    const runningIndex = sessions.findIndex((s) => s.status === "running");

    // Before any race starts, the first queued race is the next up.
    if (runningIndex === -1) return sessions[0];

    // Once a race is running, next up is the next queued race after it.
    return sessions.slice(runningIndex + 1).find((s) => s.status !== "running");
  }, [sessions]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ background: "#f3f4f6", p: 2 }}
    >
      <Card
        variant="outlined"
        sx={{ width: "min(92vw, 720px)", p: 4, borderRadius: 3 }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Next Up
        </Typography>
        <Typography variant="h5" color="text.primary">
          {nextRace ? nextRace.name : "No next race queued"}
        </Typography>
      </Card>
    </Box>
  );
}
