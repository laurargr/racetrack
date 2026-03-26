import React from "react";
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {LeaderBoard} from "./pages/leader-board.jsx";
import {FrontDesk} from "./pages/front-desk.jsx";


export function App (){
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LeaderBoard/>}></Route>
      <Route path="/front-desk" element={<FrontDesk/>}></Route>
      <Route path="/race-control" element={<div>Safety Official</div>}></Route>
      <Route path="/lap-line-tracker" element={<div>Lap-line Observer</div>}></Route>
      <Route path="/leader-board" element={<div>Leader board</div>}></Route>
      <Route path="/next-race" element={<div>Next race</div>}></Route>
      <Route path="/race-countdown" element={<div>Race countdown</div>}></Route>
      <Route path="/race-flags" element={<div>Race flags</div>}></Route>
      <Route path="*" element={<div>Not found</div>}></Route>
    </Routes>
  </BrowserRouter>
  )
}