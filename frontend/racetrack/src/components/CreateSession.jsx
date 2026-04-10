import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import moment from "moment";
import { useState } from "react";
import { socket } from "../socket";

export function CreateSession() {
  const [sessionName, setSessionName] = useState("");
  const [startTime, setStartTime] = useState(moment());

  const handleSubmit = () => {
    if (sessionName.trim() === "") {
      alert("Session name cannot be empty");
      return;
    }
    if (!startTime) {
      alert("Please select a valid start time");
      return;
    }
    if (startTime.isBefore(moment())) {
      alert("Start time cannot be in the past");
      return;
    } 

    socket.emit("createSession", { name: sessionName, startTime: startTime.toISOString() }, (response) => {
      alert(response.message);
        setSessionName("");
        setStartTime(moment());
      });
  
    console.log("Creating session with name:", sessionName);
  };
  return (
    <>
      <Box alignItems="center" minHeight="100vh">
        <Card variant="outlined">
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography variant={"h4"}>Create Session</Typography>
            <TextField
              margin="normal"
              fullWidth
              label={"name"}
              value={sessionName}
              onChange={(event) => setSessionName(event.target.value)}
            ></TextField>
            <DateTimePicker
              label="Start Time"
              sx={{ width: "100%" }}
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
            />
            <Button
              fullWidth
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSubmit}
            >
              submit
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
