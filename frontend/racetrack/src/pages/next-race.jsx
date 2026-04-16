import { useEffect, useMemo, useState } from "react";
import { Avatar, Box, Card, Chip, Stack, Typography } from "@mui/material";
import { socket } from "../socket";

export function NextRace() {
  const [sessions, setSessions] = useState([]);
  const [drivers, setDrivers] = useState([]);

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

    socket.on("driversList", (data) => {
      setDrivers(data);
    });

    socket.auth = { username: "public" };
    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("sessionsList");
      socket.off("driversList");
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

  const assignedCars = useMemo(() => {
    if (!nextRace?.driverIds?.length) return [];

    return nextRace.driverIds.map((driverId, index) => {
      const driver = drivers.find((d) => d.id === driverId);
      return {
        id: driverId,
        carNumber: index + 1,
        name: driver?.name ?? `Unknown driver #${driverId}`,
      };
    });
  }, [nextRace, drivers]);

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

        {nextRace && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Drivers And Cars
            </Typography>

            {assignedCars.length === 0 ? (
              <Typography variant="body1" sx={{ mt: 1 }}>
                No drivers assigned yet
              </Typography>
            ) : (
              <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                {assignedCars.map((entry) => (
                  <Box
                    key={entry.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.2,
                      borderRadius: 1.5,
                      bgcolor: "#ffffff",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.2 }}
                    >
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: "#111827" }}
                      >
                        {entry.name[0]?.toUpperCase() ?? "?"}
                      </Avatar>
                      <Typography variant="body1" fontWeight={600}>
                        {entry.name}
                      </Typography>
                    </Box>

                    <Chip label={`Car ${entry.carNumber}`} size="small" />
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
}
