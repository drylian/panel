import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import env from "./env";
const backend_api = env.read("VITE_DEVELOPMENT_BACKEND_URL");
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
