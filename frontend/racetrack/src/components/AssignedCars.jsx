import { Box, Paper, Typography } from "@mui/material";
import { DriverAvatar } from "./DriverAvatar";

export const AssignedCars = ({ drivers, session }) => {
  const assignedCars = (session.driverIds || [])
    .map((driverId, index) => {
      if (!Number.isInteger(driverId)) return null;
      const driver = drivers.find((d) => d.id === driverId);
      if (!driver) return null;
      return {
        driver,
        carNumber: index + 1,
      };
    })
    .filter(Boolean);
  return (
    <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50" }}>
      <Typography
        variant="overline"
        fontSize={10}
        color="text.secondary"
        display="block"
        mb={1}
      >
        Assigned cars
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {assignedCars.map((entry) => {
          return (
            <Paper
              key={entry.driver.id}
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
              }}
            >
              <DriverAvatar name={entry.driver.name} size={28} />
              <Box>
                <Typography fontSize={12} fontWeight={600} lineHeight={1.2}>
                  {entry.driver.name}
                </Typography>
                <Typography
                  fontSize={11}
                  color="text.secondary"
                  lineHeight={1.2}
                >
                  Car Number: {entry.carNumber}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};
