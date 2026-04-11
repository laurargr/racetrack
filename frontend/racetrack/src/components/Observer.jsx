import { Box, Typography } from "@mui/material";
import { AssignedCars } from "./AssignedCars";
import { LapLineTracker } from "../pages/lap-line-tracker";
import { LapRecorder } from "./LapRecorder";
import { socket } from "../socket";

const modes = {
  safe: { color: "green" },
  hazard: { color: "yellow" },
  danger: { color: "red" },
  finish: {
    color: "white",
    pattern: "conic-gradient(#000 25%, #fff 0 50%, #000 0 75%, #fff 0)",
  },
};

export const Observer = ({ race, drivers }) => {

    const onDriverClick = (driver) => {
        socket.emit("recordLap", { driverId: driver.id, raceId: race.id }, (response) => {
            if (!response.ok) {
                alert(response.message);
            }
        });
    }

    return (
        race ? <Box
            sx={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {race.status === "running" ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography variant="h4" align="center" sx={{ mt: 4 }}>
                        Running race: {race.name}
                    </Typography>
                    <Typography variant="h6" align="center" color="text.secondary">
                        Race mode: <Box
                            component="span"
                            sx={{
                                backgroundColor: modes[race.mode]?.color || "#d32f2f",
                                backgroundImage: modes[race.mode]?.pattern,
                                backgroundSize: "28px 28px",
                                display: "inline-block",
                                width: "28px",
                                height: "28px",
                                border: "1px solid black",
                            }}
                        /> 
                    </Typography>
                    <LapRecorder race={race} drivers={drivers} onDriverClick={onDriverClick} />
                </Box>
            ) : (
                <>
                    <Typography variant="h4" align="center" sx={{ mt: 4 }}>
                        Next race: {race.name}
                    </Typography>
                    <AssignedCars drivers={drivers} session={race} />
                </>

            )}
        </Box>
            : <Box
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
};