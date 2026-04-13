import React, { useEffect, useMemo, useState } from "react";
import { socket } from "../socket";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DriverAvatar } from "../components/DriverAvatar.jsx";

const MODE_STYLES = {
  safe: { bg: "#16a34a", label: "Safe" },
  hazard: { bg: "#d97706", label: "Hazard" },
  danger: { bg: "#dc2626", label: "Danger" },
  finish: { bg: "#374151", label: "Finish" },
};

/** Build sorted leaderboard rows from a session + drivers list. */
function buildRows(session, drivers) {
  if (!session?.driverIds?.length) return [];

  return session.driverIds
    .map((driverId, idx) => {
      const driver = drivers.find((d) => d.id === driverId);
      const carNumber = idx + 1;

      const driverLaps = (session.laps ?? [])
        .filter((l) => l.driverId === driverId)
        .sort((a, b) => a.time - b.time);

      // Lap duration = elapsed time diff between consecutive recordings.
      const lapTimes = driverLaps.map(
        (lap, i) => lap.time - (i === 0 ? 0 : driverLaps[i - 1].time),
      );

      const fastestLap = lapTimes.length ? Math.min(...lapTimes) : null;

      return {
        driverId,
        name: driver?.name ?? "Unknown",
        carNumber,
        lapCount: driverLaps.length,
        fastestLap,
      };
    })
    .sort((a, b) => {
      // No laps → last place
      if (a.fastestLap === null && b.fastestLap === null)
        return b.lapCount - a.lapCount;
      if (a.fastestLap === null) return 1;
      if (b.fastestLap === null) return -1;
      return a.fastestLap - b.fastestLap;
    });
}

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function LeaderBoard() {
  const [sessions, setSessions] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);

  useEffect(() => {
    socket.on("connect", () => console.log("leaderboard connected"));
    socket.on("connect_error", () => alert("connection failed"));
    socket.on("disconnect", () => console.log("leaderboard disconnected"));
    socket.on("driversList", (data) => setDrivers(data));
    socket.on("sessionsList", (data) => setSessions(data));
    socket.on("pastSessionsList", (data) => setPastSessions(data));

    socket.auth = { username: "public" };
    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("driversList");
      socket.off("sessionsList");
      socket.off("pastSessionsList");
      socket.disconnect();
    };
  }, []);

  const runningSession = useMemo(
    () => sessions.find((s) => s.status === "running"),
    [sessions],
  );

  const lastPastSession = pastSessions[pastSessions.length - 1];

  // Live session takes priority; fall back to last past session.
  const displaySession = runningSession ?? lastPastSession ?? null;
  const isLive = Boolean(runningSession);

  const rows = useMemo(
    () => buildRows(displaySession, drivers),
    [displaySession, drivers],
  );

  const modeInfo = isLive ? (MODE_STYLES[displaySession?.mode] ?? null) : null;

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        background: "#0b1220",
        color: "#f9fafb",
        p: { xs: 2, sm: 4 },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          {!displaySession
            ? "No race running"
            : isLive
              ? displaySession.name
              : `Last Race: ${displaySession.name}`}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {isLive && displaySession && (
            <>
              <Typography variant="h5" fontWeight={600}>
                {formatTime(displaySession.remainingSeconds)} remaining
              </Typography>
              {modeInfo && (
                <Chip
                  label={modeInfo.label}
                  sx={{
                    backgroundColor: modeInfo.bg,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    height: 36,
                    px: 1,
                  }}
                />
              )}
            </>
          )}
          {!isLive && lastPastSession && (
            <Chip
              label="Final Results"
              sx={{
                backgroundColor: "#374151",
                color: "#f9fafb",
                fontWeight: 700,
                fontSize: 14,
                height: 36,
                px: 1,
              }}
            />
          )}
        </Box>
      </Box>

      {/* ── Leaderboard table ── */}
      <Paper
        sx={{
          background: "#111827",
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #1f2937",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  color: "#9ca3af",
                  borderColor: "#1f2937",
                  fontWeight: 700,
                },
              }}
            >
              <TableCell>Rank</TableCell>
              <TableCell>Car</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell align="center">Laps</TableCell>
              <TableCell align="center">Fastest Lap</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ color: "#6b7280", py: 6, borderColor: "#1f2937" }}
                >
                  No participants yet
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={row.driverId}
                  sx={{
                    "& td": { color: "#f9fafb", borderColor: "#1f2937" },
                    "&:hover": { background: "#1f2937" },
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, fontSize: 18, width: 60 }}>
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`Car ${row.carNumber}`}
                      size="small"
                      sx={{
                        background: "#2563eb",
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <DriverAvatar name={row.name} size={32} />
                      <Typography fontWeight={600}>{row.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={600}>{row.lapCount}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={600}>
                      {row.fastestLap !== null
                        ? formatTime(row.fastestLap)
                        : "—"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
