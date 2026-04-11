import React from "react";

export function LeaderBoard() {
  const colors = ["red", "blue", "green", "yellow"];

  const handleClick = (color) => {
    console.log(color);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 100px)",
        gap: "10px",
        padding: "20px",
      }}
    >
      {colors.map((color, index) => (
        <div
          key={index}
          style={{
            width: "100px",
            height: "100px",
            backgroundColor: color,
            cursor: "pointer",
            border: "1px solid #000",
          }}
          onClick={() => handleClick(color)}
        />
      ))}
    </div>
  );
}
