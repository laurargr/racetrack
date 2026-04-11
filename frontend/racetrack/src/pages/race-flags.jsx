import { useEffect, useState } from "react";
import { socket } from "../socket";
import { Box, Typography } from "@mui/material";

const modes = {
  safe: { color: "green" },
  hazard: { color: "yellow" },
  danger: { color: "red" },
  finish: {
    color: "white",
    pattern: "conic-gradient(#000 25%, #fff 0 50%, #000 0 75%, #fff 0)",
  },
};

export const RaceFlags = () => {
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
      console.log("received sessions list", data);
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

  const runningSession = sessions.find((s) => s.status === "running");
  const currentMode = runningSession?.mode || "finish";
  const isFinish = currentMode === "finish";

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: modes[currentMode]?.color || "gray",
          backgroundImage: isFinish ? modes.finish.pattern : "none",
          backgroundSize: isFinish ? "36px 36px" : "auto",
        }}
      />
    </Box>
  );
};
