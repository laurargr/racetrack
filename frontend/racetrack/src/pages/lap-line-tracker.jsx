import React, {useEffect, useState} from "react";
import {socket} from "../socket.js"
import {Login} from "../components/Login.jsx";
import { Observer } from "../components/Observer.jsx";


export function LapLineTracker() {
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [sessions, setSessions] = useState([]);

     useEffect(() => {
        
       socket.on("connect", () => {
         setLoading(false);
         console.log("Connected to server");
         setConnected(true);
       });
       socket.on("connect_error", () => {
         alert("invalid credentials");
         setLoading(false);
       });
       socket.on("driversList", (data) => {
         setDrivers(data);
       });
       socket.on("sessionsList", (data) => {
         setSessions(data);
       });
       socket.on("disconnect", () => {
         setConnected(false);
         console.log("disconnected from server");
       });
       return () => {
         socket.off("connect");
         socket.off("connect_error");
         socket.off("driversList");
         socket.off("sessionsList");
         socket.off("disconnect");
         socket.disconnect();
       };
     }, []);

     const runningRaceOrNextUp =
       sessions.find((s) => s.status === "running") || sessions[0];

     return (
        connected ? (<Observer race={runningRaceOrNextUp} drivers={drivers} />
        ) : (
            <Login username="lap-line-observer" loading={loading} setLoading={setLoading} />
        )
     )
        
}