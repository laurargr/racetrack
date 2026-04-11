import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import { useState } from "react";
import { socket } from "../socket";

export const Login = ({ username, loading, setLoading }) => {
  const [password, setPassword] = useState("");

  function connectToWebsocket(username, password) {

    if (loading) {
      return;
    }

    socket.auth = {
      username,
      token: password,
    };

    console.log("Attempting to connect to websocket with username", username);
    socket.connect();
    setLoading(true);
    setPassword("");
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Card variant="outlined" sx={{ maxWidth: 500 }}>
        <CardContent>
          <Typography variant={"h4"}>Hi {username}</Typography>
          <TextField
            margin="normal"
            fullWidth
            label={"password"}
            type={"password"}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          <Button
            fullWidth
            variant="contained"
            endIcon={<SendIcon />}
            onClick={() => {
              connectToWebsocket(username, password);
            }}
          >
            submit
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
