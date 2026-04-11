import { Box, Typography } from "@mui/material";
import { DriverAvatar } from "./DriverAvatar";

export const LapRecorder = ({ race, drivers, onDriverClick = () => {} }) => {

    return race.driverIds.length > 0 ? (
        <Box sx={{ mt: 4, width: "80%", mx: "auto" }}>
            {race.driverIds.map((driverId) => {
                const driver = drivers.find((d) => d.id === driverId);
                if (!driver) return null;

                return (
                    <Box
                        key={driverId}
                        role="button"
                        tabIndex={0}
                        onClick={() => onDriverClick(driver)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onDriverClick(driver);
                            }
                        }}
                        sx={{
                            mb: 2,
                            border: "1px solid #e5e7eb",
                            borderRadius: 1,
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            cursor: "pointer",
                            userSelect: "none",
                            "&:hover": { backgroundColor: "#f9fafb" },
                            "&:focus-visible": {
                                outline: "2px solid #1976d2",
                                outlineOffset: 2,
                            },
                        }}
                    >
                        <DriverAvatar name={driver.name} size={28} />
                        <Box>
                            <Typography fontSize={12} fontWeight={600} lineHeight={1.2}>
                                {driver.name}
                            </Typography>
                            <Typography
                                fontSize={11}
                                color="text.secondary"
                                lineHeight={1.2}
                            >
                                Car Number: {race.driverIds.indexOf(driver.id) + 1}
                            </Typography>
                        </Box>
                        <Typography
                            fontSize={14}
                            color="text.primary"
                            lineHeight={1.2}
                            sx={{ ml: "auto" }}
                        >
                            Lap Count {race.laps?.filter((lap) => lap.driverId === driver.id).length || 0}
                        </Typography>
                    </Box>
                );
            })}

        </Box>
    ) : <Box sx={{ mt: 4, width: "80%", mx: "auto", textAlign: "center" }}> No drivers in the race </Box>
};