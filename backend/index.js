require("dotenv").config();
const { validations, handleAuthentication } = require("./validations");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

validations();
const drivers = [];
const sessions = [];
const cars = [
  {
    id: 1,
    name: "Car A",
  },
  {
    id: 2,
    name: "Car B",
  },
  {
    id: 3,
    name: "Car C",
  },
  {
    id: 4,
    name: "Car D",
  },
  {
    id: 5,
    name: "Car E",
  },
  {
    id: 6,
    name: "Car F",
  },
  {
    id: 7,
    name: "Car G",
  },
  {
    id: 8,
    name: "Car H",
  },
];

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use((client, next) => {
  const username = client.handshake.auth.username;
  const token = client.handshake.auth.token;

  const authenticationResponse = handleAuthentication(username, token);
  if (authenticationResponse) {
    next();
  } else {
    console.log("authentication falied for user", username);
    setTimeout(() => {
      next(new Error("invalid access key"));
    }, 500);
  }
});

io.on("connection", (client) => {
  console.log("client connected " + client.id);
  client.emit("driversList", drivers);
  client.emit("sessionsList", sessions);

  client.on("disconnect", (client) => {
    console.log("client " + client.id + " disconnected");
  });

  client.on("createDriver", (data, callback) => {
    console.log("creating driver with name", data.name);
    const newDriver = {
      id: drivers.length + 1,
      name: data.name,
    };
    if (drivers.find((d) => d.name === newDriver.name)) {
      callback({ message: "driver with this name already exists" });
      return;
    }
    drivers.push(newDriver);
    io.emit("driversList", drivers);
    callback({ message: "driver created successfully" });
  });

  client.on("createSession", (data, callback) => {
    console.log("creating session with name", data.name);
    const newSession = {
      id: sessions.length + 1,
      name: data.name,
      startTime: data.startTime,
      driverIds: [],
    };
    sessions.push(newSession);
    io.emit("sessionsList", sessions);
    callback({ message: "session created successfully" });
  });
});

httpServer.listen(3000, () => {
  console.log("server running");
});
