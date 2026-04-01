import React, {useEffect, useState} from "react";
import {socket} from "../socket.js"
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {Typography} from "@mui/material";
import TextField from "@mui/material/TextField";
import {Button} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import Box from "@mui/material/Box";


export function FrontDesk() {

    const [password, setPassword] = useState("");
    const [loading, setloading] = useState(false);

    useEffect(() => {
        socket.on("connect", () => {
            setloading(false);
            console.log("Connected to server")
        })
        socket.on("connect_error", () => {
            alert("invalid credentials")
            setloading(false);
        })
        socket.on("disconnect", () => {
            console.log("disconnected from server")
        })
        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("disconnect");
            socket.disconnect();
        }
    }, []);

    function connectToWebsocket() {
        if (loading) {
            return
        }

        socket.auth = {
            username: "receptionist",
            token: password
        }
        socket.connect()
        setloading(true);
        setPassword("");
    }
    return (

        <Box display="flex"
             justifyContent="center"
             alignItems="center"
             minHeight="100vh">
            <Card variant="outlined"    sx = {{maxWidth:500}}>
                <CardContent>
                    <Typography variant={"h4"}>
                    Hi recepcionist
                    </Typography>
                    <TextField margin="normal" fullWidth label={"password"} type={"password"} onChange={(event) => {setPassword(event.target.value);}}></TextField>
                    <Button fullWidth variant ="contained" endIcon={<SendIcon />} onClick={()=> connectToWebsocket()}>submit</Button>
                </CardContent>
            </Card>

        </Box>

    )
}