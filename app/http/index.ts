import Elysia from "elysia";
import { staticPlugin } from "@elysiajs/static";
export async function HttpController() {
  const app = new Elysia();
  app.use(
    staticPlugin({
      assets: "./public",
      prefix: "/",
    }),
  );
  /**
   * React mode check
   */
  if (process.argv.includes("--vite")) {
    (await import ("@/libs/vite")).useVite(app);
    console.log(
      __("mode_running_on_port", {
        mode: "RESTAPI",
        port: Env.get("app.port"),
      }),
    );
    console.log(
      __("mode_running_on_port", {
        mode: "VITE",
        port: "5173",
      }),
    );
  } else {
    console.log(
      __("mode_running_on_port", {
        mode: "Dashboard",
        port: Env.get("app.port"),
      }),
    );
  }

  return app;
}
