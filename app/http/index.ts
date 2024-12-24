import Elysia from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { sessionPlugin } from "elysia-session";
import { MemoryStore } from "elysia-session/stores/memory";
export async function HttpController() {
  const app = new Elysia();
  app.use(
    staticPlugin({
      assets: "./public",
      prefix: "/",
    }),
  );

  app.use(sessionPlugin({
    cookieName:Env.get("session.cookie"),
    store:new MemoryStore(),
    expireAfter: 15 * 60,
  }))
  /**
   * React mode check
   */
  if (process.argv.includes("--vite")) {
    (await import("@/libs/vite")).useVite(app);
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
