import { watch } from "node:fs";
import { exec, execSync } from "node:child_process";
import os from "node:os";
import fs from "node:fs";
import env from "@/libs/env.ts";
import { Terminal } from "@/controllers/terminal.ts";
import { execute, executeSync } from "@/helpers.ts";

let VITE_PORT = 3000;
let timeout: number | null = null;

/**
 * Start Vite configurations in server
 */
export function Vite(port: number = 3000, backend = 3001) {
    VITE_PORT = port;
    if (!vite.process) {
        kill();
        if (!fs.existsSync("./resources/node_modules")) {
            console.log(`Installing node_modules of resources.`);
            execSync(`cd ./resources && npm install`);
        }
        env.save(
            "VITE_DEVELOPMENT_BACKEND_URL",
            `http://localhost:${backend}`,
            "Only development",
            "./resources/.env",
        );
        vite.start();
    }

    new Terminal({
        name: "npm",
        description: "Manager npm of frontend",
        args: ["command"],
        async run(_, args) {
            await execute(`cd ./resources && npm ${args.join(" ")}`);
        },
    });

    watch("./resources/package.json", function () {
        if (!timeout) {
            console.log(
                "Resources package as [changed].gree-b, restarting [vite].blue...",
            );
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
                    console.log(
                        `Process using port ${VITE_PORT} with PID ${pid} has been killed.`,
                    );
                } else {
                    console.log(`No PID found for port ${VITE_PORT}.`);
                }
            } else {
                console.log(`No process found using port ${VITE_PORT}.`);
            }
        } else {
            const pid = execSync(`lsof -t -i :${VITE_PORT}`).toString().trim();
            if (pid) {
                if (pid === "0") return;
                execSync(`kill -9 ${pid}`);
                console.log(
                    `Process using port ${VITE_PORT} with PID ${pid} has been killed.`,
                );
            } else {
                console.log(`No process found using port ${VITE_PORT}.`);
            }
        }
    } catch (err) {
        const error = err as InstanceType<typeof Error>;
        console.error(
            `Failed to kill process using port ${VITE_PORT}: ${error.message}`,
        );
    }
}

class Controller {
    public static command = `cd ./resources && npx vite --port ${VITE_PORT}`;
    constructor() {
        console.log("[Vite].lime-b loaded [configurations].green-b.");
    }
    public process: ReturnType<typeof exec> | null = null;

    public start() {
        if (this.process && !this.process.killed) {
            console.log("[Vite].lime-b is already [running].green-b.");
            return;
        }
        this.process = executeSync(Controller.command);

        console.log("[Vite].lime-b started.");
    }

    public restart() {
        kill();
        this.process = null;
        this.start();
    }
}
const vite = new Controller();
