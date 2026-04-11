import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { socket } from "../socket";
import {
  Add,
  Close,
  EmojiEvents,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useState } from "react";
import { DriverAvatar } from "./DriverAvatar";

const MAX_DRIVERS = 8;

export const SessionManagement = ({ sessions, drivers }) => {
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
    setModal({ sessionId, tempSelected: [...session.driverIds] });
  };

  const toggleModalDriver = (driverId) => {
    setModal((m) => {
      const sel = m.tempSelected.includes(driverId);
      if (sel)
        return {
          ...m,
          tempSelected: m.tempSelected.filter((id) => id !== driverId),
        };
      if (m.tempSelected.length >= MAX_DRIVERS) return m;
      return { ...m, tempSelected: [...m.tempSelected, driverId] };
    });

    console.log(modal);
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

      {sessions.map((s) => {
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
                {/* <Tooltip title={s.expanded ? "Hide Cars" : "Show Cars"}>
                  <IconButton
                    size="small"
                    //   onClick={() => toggleExpand(s.id)}
                  >
                    {s.expanded ? (
                      <ExpandLess fontSize="small" />
                    ) : (
                      <ExpandMore fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip> */}
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

            {/* <Collapse in={s.expanded}> */}
            <Divider />
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
                        <Typography
                          fontSize={12}
                          fontWeight={600}
                          lineHeight={1.2}
                        >
                          {d.name}
                        </Typography>
                        <Typography
                          fontSize={11}
                          color="text.secondary"
                          lineHeight={1.2}
                        >
                          Car Number: {s.driverIds.indexOf(d.id) + 1}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
            {/* </Collapse> */}
          </Paper>
        );
      })}

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
          {modal?.tempSelected.length}/{MAX_DRIVERS} selected. Cars are
          automatically assinged per selected order.
        </Typography>
        <DialogContent sx={{ pt: 0 }}>
          <List dense disablePadding>
            {drivers.map((d) => {
              const sel = modal?.tempSelected.includes(d.id) || false;
              const full = (modal?.tempSelected.length || 0) >= MAX_DRIVERS;
              const disabled = !sel && full;
              return (
                <ListItem key={d.id} disablePadding>
                  <ListItemButton
                    onClick={() => !disabled && toggleModalDriver(d.id)}
                    disabled={disabled}
                    selected={sel}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <DriverAvatar name={d.name} size={32} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={d.name}
                      secondary={
                        "Car Number: " +
                        (modal?.tempSelected.indexOf(d.id) + 1 || "N/A")
                      }
                    />
                    <Checkbox
                      checked={sel}
                      tabIndex={-1}
                      disableRipple
                      color="primary"
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
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
