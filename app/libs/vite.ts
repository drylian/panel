import { watch } from "node:fs";
import { exec, execSync } from "node:child_process";
import os from "node:os";
import fs from "node:fs";
import { Terminal } from "@/controllers/terminal";
import { Handler, Elysia } from "elysia";

let timeout: NodeJS.Timeout | null = null;
export const VITE_PORT = 5173;
const TARGET = `http://localhost:${VITE_PORT}`;

/**
 * Vite dev Handler
 */
export function ViteHandler(app: Elysia) {
  function Handle(
    ctx: Handler & {
      headers: Record<string, string | undefined>;
      request: Request;
      body: string;
      path: string;
    },
  ) {
    let params = {
      method: ctx.request.method,
      body: "",
      headers: {
        ...ctx.headers,
        host: TARGET.split("//")[1],
        referer: TARGET,
      },
    };
    if (["post", "put"].includes(ctx.request.method.toLowerCase())) {
      params.body = ctx.headers["content-type"]!.startsWith("application/json")
        ? JSON.stringify(ctx.body)
        : ctx.body;
    }
    return fetch(`${TARGET}${ctx.path}`, params);
  }
  app.get("*", Handle);
  app.post("*", Handle);
  app.put("*", Handle);
  return app;
}

/**
 * Start Vite configurations in server
 */
export function Vite() {
  if (!vite.process) {
    kill();
    if (!fs.existsSync("./resources/node_modules")) {
      console.log(__("vite_installing_node_modules"));
      execSync(`cd ./resources && bun install`);
    }
    //server.use(HttpProxy, {
    //  upstream: TARGET,
    //  prefix: "/",
    //  websocket: true,
    //  http2: false,
    //});
    vite.start();
  }

  new Terminal({
    name: "vite",
    desc: __("terminal_execute_npm_commands_on_react_path"),
    async run(_, args) {
      if (args.length && args.includes("--restart")) {
        vite.restart();
      } else {
        execSync("cd ./resources && bun " + args.join(" "), {
          stdio: "inherit",
        });
        execSync("cd ..", { stdio: "inherit" });
      }
    },
  });

  new Terminal({
    name: "bunx",
    desc: __("terminal_execute_npx_commands_on_react_path"),
    async run(_, args) {
      execSync("cd ./resources && bunx " + args.join(" "), {
        stdio: "inherit",
      });
      execSync("cd ..", { stdio: "inherit" });
    },
  });

  watch("./resources/package.json", function () {
    if (!timeout) {
      console.log(__("vite_resources_package_changed"));
      vite.restart();
      timeout = setTimeout(function () {
        timeout = null;
      }, 100);
    }
  });
}

function kill() {
  try {
    if (os.platform() === "win32") {
      const netstatOutput = execSync("netstat -a -n -o").toString();
      const lines = netstatOutput.split("\n");
      const line = lines.find((line) => line.includes(`:${VITE_PORT}`));
      if (line) {
        const pid = line.trim().split(/\s+/).pop();
        if (pid) {
          if (pid === "0") return;
          execSync(`taskkill /F /PID ${pid}`);
          console.log(__("vite_killed_pid", { port: VITE_PORT, pid }));
        } else {
          console.log(__("vite_no_pid_found", { port: VITE_PORT }));
        }
      } else {
        console.log(__("vite_no_process_found", { port: VITE_PORT }));
      }
    } else {
      const pid = execSync(`lsof -t -i :${VITE_PORT}`).toString().trim();
      if (pid) {
        if (pid === "0") return;
        execSync(`kill -9 ${pid}`);
        console.log(__("vite_killed_pid", { port: VITE_PORT, pid }));
      } else {
        console.log(__("vite_no_process_found", { port: VITE_PORT }));
      }
    }
  } catch (err) {
    const error = err as InstanceType<typeof Error>;
    console.error(
      __("vite_failed_killing_pid", {
        port: VITE_PORT,
        message: error.message,
      }),
    );
  }
}

class Controller {
  public static command = `cd ./resources && bun vite --port ${VITE_PORT}`;
  constructor() {
    console.log(__("vite_starting"));
  }
  public process: ReturnType<typeof exec> | null = null;

  public start() {
    if (this.process && !this.process.killed) {
      console.log(__("vite_running"));
      return;
    }
    this.process = exec(Controller.command);

    console.log(__("vite_started"));
  }

  public restart() {
    kill();
    this.process = null;
    this.start();
  }
}
const vite = new Controller();
