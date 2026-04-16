import React, { useEffect, useState } from "react";
import { socket } from "../socket.js";
import { Login } from "../components/Login.jsx";
import Box from "@mui/material/Box";
import { DriverManagement } from "../components/DriverManagement.jsx";
import { SessionManagement } from "../components/SessionManagement.jsx";

export function FrontDesk() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      setLoading(false);
      setConnected(true);
      console.log("Connected to server");
    });
    socket.on("connect_error", () => {
      alert("invalid credentials");
      setLoading(false);
    });
    socket.on("disconnect", () => {
      setConnected(false);
      console.log("disconnected from server");
    });
    socket.on("driversList", (data) => {
      setDrivers(data);
    });
    socket.on("sessionsList", (data) => {
      console.log("received sessions list", data);
      setSessions(data);
    });
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("driversList");
      socket.off("sessionsList");
      socket.disconnect();
    };
  }, []);

  return connected ? (
    <Box sx={{ minHeight: "100vh", p: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          minWidth: "100%",
          mx: "auto",
        }}
      >
        <DriverManagement drivers={drivers} sessions={sessions} />
        <SessionManagement sessions={sessions} drivers={drivers} />
      </Box>
    </Box>
  ) : (
    <Login username="receptionist" loading={loading} setLoading={setLoading} />
  );
}
