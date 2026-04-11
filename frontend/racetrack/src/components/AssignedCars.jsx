import { Box, Paper, Typography } from "@mui/material";
import { DriverAvatar } from "./DriverAvatar";

export const AssignedCars = ({ drivers, session }) => {
  const assigned = session.driverIds
    .map((id) => drivers.find((d) => d.id === id))
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
        {assigned.map((d) => {
          return (
            <Paper
              key={d.id}
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
              }}
            >
              <DriverAvatar name={d.name} size={28} />
              <Box>
                <Typography fontSize={12} fontWeight={600} lineHeight={1.2}>
                  {d.name}
                </Typography>
                <Typography
                  fontSize={11}
                  color="text.secondary"
                  lineHeight={1.2}
                >
                  Car Number: {session.driverIds.indexOf(d.id) + 1}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};
