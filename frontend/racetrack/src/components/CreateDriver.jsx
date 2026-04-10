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

export function CreateDriver() {
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (name.trim() === "") {
            alert("Name cannot be empty");
            return;
        }
        console.log("Creating driver with name:", name);
        socket.emit("createDriver", { name }, (response) => {
            alert(response.message);
            setName("");
        });
    };

    return (
        <>
            <Box
                alignItems="center"
                minHeight="100vh"
      >
        <Card variant="outlined" >
          <CardContent>
            <Typography variant={"h4"}>Create new driver</Typography>
            <TextField margin="normal" fullWidth label={"name"} value={name} onChange={(event) => setName(event.target.value)}></TextField>
            <Button fullWidth variant="contained" endIcon={<SendIcon /> } onClick={handleSubmit}>
              submit
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
