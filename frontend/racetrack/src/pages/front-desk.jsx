import React, { useEffect, useState } from "react";
import { socket } from "../socket.js";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import { DriverManagement } from "../components/DriverManagement.jsx";
import { SessionManagement } from "../components/SessionManagement.jsx";

export function FrontDesk() {
  const [password, setPassword] = useState("");
  const [loading, setloading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      setloading(false);
      setConnected(true);
      console.log("Connected to server");
    });
    socket.on("connect_error", () => {
      alert("invalid credentials");
      setloading(false);
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

  function connectToWebsocket() {
    if (loading) {
      return;
    }

    socket.auth = {
      username: "receptionist",
      token: password,
    };
    socket.connect();
    setloading(true);
    setPassword("");
  }
  return connected ? (
    <Box sx={{ minHeight: "100vh", p: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        <DriverManagement drivers={drivers} />
        <SessionManagement sessions={sessions} drivers={drivers} />
      </Box>
    </Box>
  ) : (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Card variant="outlined" sx={{ maxWidth: 500 }}>
        <CardContent>
          <Typography variant={"h4"}>Hi recepcionist</Typography>
          <TextField
            margin="normal"
            fullWidth
            label={"password"}
            type={"password"}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          ></TextField>
          <Button
            fullWidth
            variant="contained"
            endIcon={<SendIcon />}
            onClick={() => connectToWebsocket()}
          >
            submit
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
