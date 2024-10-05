import { ViteHandler, Vite, VITE_PORT } from "@/libs/vite";
import Elysia from "elysia";
export async function HttpController() {
  const app = new Elysia();
  if (Config.get("node") === "development") {
    Vite();
    ViteHandler(app);
    console.log(
      __("mode_running_on_port", {
        mode: "RESTAPI",
        port: Config.get("port"),
      }),
    );
    console.log(
      __("mode_running_on_port", {
        mode: "VITE",
        port: VITE_PORT,
      }),
    );
  } else {
    console.log(
      __("mode_running_on_port", {
        mode: "Dashboard",
        port: Config.get("port"),
      }),
    );
  }

  return app;
}
