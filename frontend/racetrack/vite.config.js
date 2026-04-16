import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, import.meta.url, "");
  return defineConfig({
    plugins: [react()],

    // optional: expose without VITE_ prefix (not recommended)
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
    },
  });
};
