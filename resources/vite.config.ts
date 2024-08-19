import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import env from "./env";
import path from "path";
const backend_api = env.read("VITE_DEVELOPMENT_BACKEND_URL");
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve:{
    alias:{
      "@": path.resolve(__dirname, "./src"),
    }
  },
  server: {
    proxy: {
      "/*": {
        target: backend_api,
        changeOrigin: true,
        rewrite: (path) => {
          return path;
        },
      },
    },
  },
});
