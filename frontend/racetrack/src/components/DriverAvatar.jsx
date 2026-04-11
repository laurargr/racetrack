import { Avatar } from "@mui/material";

const AVATAR_COLORS = [
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#d1fae5", text: "#065f46" },
  { bg: "#ede9fe", text: "#4c1d95" },
  { bg: "#fee2e2", text: "#7f1d1d" },
  { bg: "#fef3c7", text: "#78350f" },
  { bg: "#fce7f3", text: "#831843" },
  { bg: "#ecfdf5", text: "#064e3b" },
  { bg: "#fff7ed", text: "#7c2d12" },
];

function getAvatarColor(name) {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function DriverAvatar({ name, size = 32 }) {
  const { bg, text } = getAvatarColor(name);
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: bg,
        color: text,
        fontSize: size * 0.35,
        fontWeight: 600,
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </Avatar>
  );
}
