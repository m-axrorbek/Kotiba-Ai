import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/assistant/analyze": {
        target: "http://localhost:4000",
        changeOrigin: true
      },
      "/api/uzbekvoice/stt": {
        target: "https://uzbekvoice.ai",
        changeOrigin: true,
        rewrite: (path) => path.replace("/api/uzbekvoice/stt", "/api/v1/stt")
      },
      "/api/uzbekvoice/tts": {
        target: "https://uzbekvoice.ai",
        changeOrigin: true,
        rewrite: (path) => path.replace("/api/uzbekvoice/tts", "/api/v1/tts")
      }
    }
  }
});
