import React, { useEffect, useState } from "react";
import { socket } from "../socket.js";
import { Login } from "../components/Login.jsx";
import { Box } from "@mui/material";
import { UpcomingRace } from "../components/UpcommingRace.jsx";
import { AssignedCars } from "../components/AssignedCars.jsx";
import { RaceModeControl } from "../components/RaceModeControl.jsx";

export function RaceControl() {
  const [connected, setConnected] = useState(false);
  const [loading, setloading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      setloading(false);
      console.log("Connected to server");
      setConnected(true);
    });
    socket.on("connect_error", () => {
      alert("invalid credentials");
      setloading(false);
    });
    socket.on("driversList", (data) => {
      setDrivers(data);
    });
    socket.on("sessionsList", (data) => {
      setSessions(data);
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
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  const runningRaceOrNextUp =
    sessions.find((s) => s.status === "running") || sessions[0];

  const nextRace = sessions.find(
    (s) => s.status !== "running" && s.id !== runningRaceOrNextUp?.id,
  );

  const setCurrentRaceMode = (mode) =>
    socket.emit(
      "setRaceMode",
      { raceId: runningRaceOrNextUp?.id, mode },
      (response) => {
        if (!response.ok) alert(response.message);
      },
    );

  return connected ? (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 2, pt: 2 }}>
        <UpcomingRace race={runningRaceOrNextUp} nextRace={nextRace} />
        {runningRaceOrNextUp && (
          <Box sx={{ mt: 2 }}>
            <AssignedCars drivers={drivers} session={runningRaceOrNextUp} />
          </Box>
        )}
      </Box>

      {runningRaceOrNextUp?.status === "running" && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            p: 2,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 2,
          }}
        >
          <RaceModeControl
            mode="safe"
            onClick={() => setCurrentRaceMode("safe")}
          />
          <RaceModeControl
            mode="hazard"
            onClick={() => setCurrentRaceMode("hazard")}
          />
          <RaceModeControl
            mode="danger"
            onClick={() => setCurrentRaceMode("danger")}
          />
          <RaceModeControl
            mode="finish"
            onClick={() => setCurrentRaceMode("finish")}
          />
        </Box>
      )}
    </Box>
  ) : (
    <Login
      title="Safety Officer"
      username="safety-officer"
      loading={loading}
      setLoading={setloading}
    />
  );
}
