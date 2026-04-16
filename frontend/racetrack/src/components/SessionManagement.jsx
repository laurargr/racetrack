import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { socket } from "../socket";
import { Add, Close, EmojiEvents } from "@mui/icons-material";
import { useState } from "react";
import { AssignedCars } from "./AssignedCars";

const MAX_DRIVERS = 8;

export const SessionManagement = ({ sessions, drivers }) => {
  const sessionsToShow = sessions.filter((s) => s.status !== "running");

  const normalizeCarAssignments = (driverIds = []) => {
    const normalized = Array(MAX_DRIVERS).fill(null);
    driverIds.slice(0, MAX_DRIVERS).forEach((id, index) => {
      normalized[index] = Number.isInteger(id) ? id : null;
    });
    return normalized;
  };

  const getAssignedCount = (driverIds = []) =>
    driverIds.filter((id) => id !== null).length;

  const handleAddDriversToSession = (session, selectedDrivers) => {
    console.log("Adding drivers", selectedDrivers, "to session", session);
    socket.emit(
      "assignDriverToSession",
      { sessionId: session.id, driverIds: selectedDrivers },
      (response) => {
        if (!response.ok) alert(response.message);
      },
    );
    setModal(null);
  };

  const handleDeleteSession = (sessionId) => {
    socket.emit("deleteSession", { sessionId });
  };

  const [modal, setModal] = useState(null); // { sessionId, tempSelected }
  const currentSession = modal
    ? sessions.find((s) => s.id === modal.sessionId)
    : null;

  const openModal = (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    setModal({
      sessionId,
      tempSelected: normalizeCarAssignments(session?.driverIds ?? []),
    });
  };

  const assignDriverToCar = (carIndex, rawValue) => {
    setModal((m) => {
      const nextSelected = [...m.tempSelected];
      const driverId = rawValue === "" ? null : Number(rawValue);

      if (driverId !== null) {
        const duplicateIndex = nextSelected.findIndex((id) => id === driverId);
        if (duplicateIndex !== -1) {
          nextSelected[duplicateIndex] = null;
        }
      }

      nextSelected[carIndex] = Number.isInteger(driverId) ? driverId : null;
      return { ...m, tempSelected: nextSelected };
    });
  };

  const handleCreateSession = () => {
    socket.emit("createSession");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="overline" fontWeight={600}>
          Sessions
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleCreateSession}
          disableElevation
        >
          Session
        </Button>
      </Box>

      {/* show only sessions that are not running */}
      {sessionsToShow.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">No sessions available</Typography>
        </Box>
      ) : (
        sessionsToShow.map((s) => {
          const assigned = s.driverIds
            .map((id) => drivers.find((d) => d.id === id))
            .filter(Boolean);
          const full = assigned.length >= MAX_DRIVERS;

          return (
            <Paper key={s.id} sx={{ overflow: "hidden" }}>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EmojiEvents sx={{ fontSize: 18, color: "warning.main" }} />
                  <Typography fontWeight={600} fontSize={14}>
                    {s.name}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title={full ? "Edit Drivers" : "Add Drivers"}>
                    <Button
                      size="small"
                      onClick={() => openModal(s.id)}
                      sx={{ minWidth: 0, fontSize: 12 }}
                    >
                      {full ? "✎ edit" : "+ drivers"}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Remove Session">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteSession(s.id)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <Divider />
              <AssignedCars drivers={drivers} session={s} />
            </Paper>
          );
        })
      )}

      <Dialog
        open={!!modal}
        onClose={() => setModal(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 0 }}>
          Drivers - {currentSession?.name}
        </DialogTitle>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 3, pb: 1 }}
        >
          {getAssignedCount(modal?.tempSelected)}/{MAX_DRIVERS} assigned. Pick
          each car driver directly.
        </Typography>
        <DialogContent sx={{ pt: 0 }}>
          <Stack spacing={1}>
            {Array.from({ length: MAX_DRIVERS }).map((_, index) => {
              const selectedDriverId = modal?.tempSelected[index] ?? null;

              return (
                <FormControl key={index} fullWidth size="small">
                  <InputLabel>{`Car ${index + 1}`}</InputLabel>
                  <Select
                    label={`Car ${index + 1}`}
                    value={selectedDriverId ?? ""}
                    onChange={(event) =>
                      assignDriverToCar(index, event.target.value)
                    }
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {drivers.map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModal(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              handleAddDriversToSession(currentSession, modal?.tempSelected)
            }
            disableElevation
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
