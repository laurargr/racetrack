import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  TextField,
  Button,
  Tooltip,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
} from "@mui/material";

import { Add, Close, Edit } from "@mui/icons-material";

import { socket } from "../socket";
import { useState } from "react";
import { DriverAvatar } from "./DriverAvatar";

export function DriverManagement({ drivers }) {
  const [name, setName] = useState("");

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null); // { id, name }

  const handleSubmit = () => {
    if (name.trim() === "") {
      alert("Name cannot be empty");
      return;
    }
    console.log("Creating driver with name:", name);
    socket.emit("createDriver", { name }, (response) => {
      if (!response.ok) alert(response.message);
      setName("");
    });
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingDriver(null);
  };

  const hanndleDeleteDriver = (driverId) => {
    socket.emit("deleteDriver", { driverId }, (response) => {
      if (!response.ok) alert(response.message);
    });
  };

  const handleOkModal = () => {
    if (editingDriver.name.trim() === "") {
      alert("Name cannot be empty");
      return;
    }
    socket.emit(
      "editDriver",
      { driverId: editingDriver.id, name: editingDriver.name },
      (response) => {
        if (!response.ok) alert(response.message);
        handleCloseEditModal();
      },
    );
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setOpenEditModal(true);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper>
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
          <Typography
            variant="overline"
            fontWeight={600}
            color="text.secondary"
          >
            Drivers
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }}>ID</TableCell>
                <TableCell>Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((d) => {
                return (
                  <TableRow key={d.id} hover>
                    <TableCell sx={{ color: "text.disabled", fontSize: 12 }}>
                      {d.id}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <DriverAvatar name={d.name} />
                        <Typography variant="body2">{d.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Driver">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditDriver(d)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => hanndleDeleteDriver(d.id)}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: "grey.50",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="overline" fontSize={10} color="text.secondary">
            Add Driver
          </Typography>
          <Stack direction="row" spacing={1} mt={0.5}>
            <TextField
              size="small"
              fullWidth
              placeholder="Name of the driver..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<Add />}
              disableElevation
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Dialog
        open={openEditModal}
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="xs"
      >
        {/* modal do edit driver name */}
        <DialogTitle sx={{ pb: 0 }}>Drivers - Edit Name</DialogTitle>
        <DialogContent>
          <Box p={2}>
            <TextField
              size="small"
              fullWidth
              placeholder="Name of the driver..."
              value={editingDriver?.name || ""}
              onChange={(e) =>
                setEditingDriver({ ...editingDriver, name: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button variant="contained" onClick={handleOkModal} disableElevation>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
