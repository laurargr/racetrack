import React, {useEffect, useState} from "react";
import {socket} from "../socket.js"
export function LapLineTracker() {

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
    }, []);

    function connectToWebsocket() {
        if (loading) {
            return
        }

        socket.auth = {
            username: "lap-line observer",
            token: password
        }
        socket.connect()
        setloading(true);
        setPassword("");
    }

    return (
        <div>
            <h1>Hi lap line tracker</h1>
            <input type={"password"} value={password} onChange={(event) => {setPassword(event.target.value)}} placeholder={"enter your password"}/>
            <button onClick={()=> connectToWebsocket()}>submit</button>
        </div>
    )
}