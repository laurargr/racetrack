require("dotenv").config();
const {validations, handleAuthentication} = require("./validations");

const express = require("express");
const http = require("http");
const {Server} = require("socket.io")

validations();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors :{
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.use((client, next) => {
    const username = client.handshake.auth.username;
    const token = client.handshake.auth.token;

    const authenticationResponse = handleAuthentication(username, token)
    if (authenticationResponse) {
        next();
    }
    else {
        console.log("authentication falied for user", username)
        setTimeout(()=>{
            next(new Error("invalid access key"))
        }, 500)
    }
});

io.on("connection", (cliet) => {
    console.log("client connected " + cliet.id)
})

io.on("disconnect", (client) => {
    console.log("client " + client.id + " disconnected")
})
httpServer.listen(3000, () => {
    console.log("server running")
})




