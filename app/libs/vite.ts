import { execSync } from "node:child_process";
import { Terminal } from "@/controllers/terminal";
import { Handler, Elysia } from "elysia";

/**
 * Vite dev Handler
 */
export function useVite(app: Elysia) {
  new Terminal({
    name: "vite",
    desc: __("terminal_execute_bun_commands_on_react_path", {
      bun:"bun"
    }),
    async run(_, args) {
      execSync("cd ./web && bun " + args.join(" "), {
        stdio: "inherit",
      });
      execSync("cd ..", { stdio: "inherit" });
    },
  });

  new Terminal({
    name: "bunx",
    desc: __("terminal_execute_bun_commands_on_react_path", {
      bun:"bunx"
    }),
    async run(_, args) {
      execSync("cd ./web && bunx " + args.join(" "), {
        stdio: "inherit",
      });
      execSync("cd ..", { stdio: "inherit" });
    },
  });

  function Handle(
    ctx: Handler & {
      headers: Record<string, string | undefined>;
      request: Request;
      body: string;
      path: string;
    },
  ) {
    const url = Env.get("app.url");
    let params = {
      method: ctx.request.method,
      body: "",
      headers: {
        ...ctx.headers,
        host: url.split("//").length < 1 ? url.split("//")[1] : url,
        referer: url,
      },
    };
    if (["post", "put"].includes(ctx.request.method.toLowerCase())) {
      params.body = ctx.headers["content-type"]!.startsWith("application/json")
        ? JSON.stringify(ctx.body)
        : ctx.body;
    }
    return fetch(`${url.endsWith("/") ? url.slice(0, url.length -1) : url}${ctx.path}`, params);
  }
  app.get("*", Handle);
  app.post("*", Handle);
  app.put("*", Handle);
  return app;
}