import { Box } from "@mui/material";

const modes = {
  safe: { color: "green" },
  hazard: { color: "yellow" },
  danger: { color: "red" },
  finish: {
    color: "white",
    pattern: "conic-gradient(#000 25%, #fff 0 50%, #000 0 75%, #fff 0)",
  },
};

export const RaceModeControl = ({ mode, onClick }) => {
  const isFinish = mode === "finish";

  return (
    <Box
      sx={{
        backgroundColor: isFinish
          ? "transparent"
          : modes[mode]?.color || "#d32f2f",
        backgroundImage: isFinish ? modes.finish.pattern : "none",
        backgroundSize: isFinish ? "28px 28px" : "auto",
        border: "1px solid black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <h1
        style={{
          color: isFinish ? "#111" : "white",
          margin: 0,
          backgroundColor: isFinish
            ? "rgba(255, 255, 255, 0.7)"
            : "transparent",
          padding: isFinish ? "4px 10px" : 0,
          borderRadius: isFinish ? "6px" : 0,
        }}
      >
        {mode.toUpperCase()}
      </h1>
    </Box>
  );
};
