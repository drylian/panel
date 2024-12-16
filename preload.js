import { Loggings } from "@loggings/beta";
import { existsSync } from "fs";

// this not is necessary, bun auto install is enabled, but in my tests bun not working properly
if (!existsSync("./node_modules")) {
  Bun.spawnSync(["bun", "install"]);
}

if (process.argv.includes("--vite") && typeof vite === "undefined") {
  const logger = new Loggings("Vite", "cyan", {
    register: false,
  });

  const decoder = new TextDecoder();

  global.vite = Bun.spawn({
    cmd: ["bunx", "vite"],
    cwd: "./web",
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });

  vite.stdout?.pipeTo(
    new WritableStream({
      write(chunk) {
        logger.log(decoder.decode(chunk));
      },
    })
  );

  vite.stderr?.pipeTo(
    new WritableStream({
      write(chunk) {
        logger.error(decoder.decode(chunk));
      },
    })
  );

  process.on("exit", () => {
    vite.kill();
  });
}
