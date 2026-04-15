import { Box, Button, Grid, Typography } from "@mui/material";
import { socket } from "../socket";

function formatMinSec(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}.${String(remainingSeconds).padStart(2, "0")}`;
}

export function UpcomingRace({ race, nextRace }) {
  const handleStartRace = () =>
    socket.emit("startSession", { sessionId: race.id }, (response) => {
      if (!response.ok) alert(response.message);
    });

  const handleEndRace = () =>
    socket.emit("endSession", { sessionId: race.id }, (response) => {
      if (!response.ok) alert(response.message);
    });

  return race ? (
    <Box
      sx={{
        p: 2,
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ m: 0 }}>
        {race.status === "running" ? "Current Race" : "Upcoming Race"} -
        {race.name}
      </Typography>

      {/* race mode */}
      {race.mode && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Mode: {race.mode.toUpperCase()}
        </Typography>
      )}

      {race.status === "running" && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Elapsed: {formatMinSec(race.elapsedSeconds)} | Remaining:{" "}
          {formatMinSec(race.remainingSeconds)}
        </Typography>
      )}

      {nextRace && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Next up: {nextRace.name}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={race.status === "running" ? handleEndRace : handleStartRace}
      >
        {race.status === "running" ? "End Race" : "Start Race"}
      </Button>
    </Box>
  ) : (
    <Box
      sx={{
        p: 2,
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        backgroundColor: "#f9fafb",
      }}
    >
      <Typography variant="h6" color="text.secondary">
        No upcoming races sit tight for now...
      </Typography>
    </Box>
  );
}
