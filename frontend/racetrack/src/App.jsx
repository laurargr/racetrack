import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LeaderBoard } from "./pages/leader-board.jsx";
import { FrontDesk } from "./pages/front-desk.jsx";
import { LapLineTracker } from "./pages/lap-line-tracker.jsx";
import { RaceControl } from "./pages/race-control.jsx";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { RaceFlags } from "./pages/race-flags.jsx";
import { RaceCountdown } from "./pages/race-countdown.jsx";
import { NextRace } from "./pages/next-race.jsx";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb", light: "#dbeafe", dark: "#1d4ed8" },
    success: { main: "#16a34a", light: "#dcfce7" },
    warning: { main: "#d97706", light: "#fef3c7" },
    error: { main: "#dc2626", light: "#fee2e2" },
    info: { main: "#0c447c", light: "#e6f1fb" },
    grey: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
      disabled: "#9ca3af",
    },
    divider: "rgba(0,0,0,0.09)",
    background: { paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: "'Inter', 'Roboto', sans-serif" },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#9ca3af",
          backgroundColor: "#ffffff",
        },
        root: { borderColor: "rgba(0,0,0,0.07)" },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 500 } },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { backgroundColor: "#e5e7eb" } },
    },
  },
});

export function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LeaderBoard />}></Route>
            <Route path="/front-desk" element={<FrontDesk />}></Route>
            <Route path="/race-control" element={<RaceControl />}></Route>
            <Route
              path="/lap-line-tracker"
              element={<LapLineTracker />}
            ></Route>
            <Route
              path="/leader-board"
              element={<div>Leader board</div>}
            ></Route>
            <Route path="/next-race" element={<NextRace />}></Route>
            <Route
              path="/race-countdown"
              element={<RaceCountdown />}
            ></Route>
            <Route path="/race-flags" element={<RaceFlags />}></Route>
            <Route path="*" element={<div>Not found</div>}></Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
