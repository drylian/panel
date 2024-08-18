import { Loggings, LoggingsConfig } from "loggings";
import {
    expandGlob,
    ExpandGlobOptions,
} from "https://deno.land/std@0.178.0/fs/expand_glob.ts";
import { exec, ExecOptions } from "node:child_process";

/**
 * This constant provides the path of the main module that started the Node.js process.
 * It's useful for determining the root directory of the project.
 */
export const rootDIR = import.meta.dirname!;

/**
 * Current mode of source, Javascript or Typescript
 */
export const modeSRC = import.meta.filename!.endsWith("ts")
    ? "Typescript"
    : "Javascript";

/**
 * Dynamically imports a module relative to a given path.
 */
export async function Dimport(to: string): Promise<unknown> {
    const path = new URL(`file:///${to.replace(/\\/g, "/")}`);
    return await import(path.href);
}

/**
 * Delay, just
 * @param ms time
 */
export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function Glob(
    patterns: string[],
    options: ExpandGlobOptions = { root: rootDIR },
) {
    const files: string[] = [];

    for (const pattern of patterns) {
        for await (const file of expandGlob(pattern, options)) {
            files.push(file.path);
        }
    }

    return files;
}

/**
 * Try callback value, case catch error set def(default)
 * @param callback
 * @param def
 * @returns
 */
export function trySet<Datable>(
    callback: () => Datable,
    def: Datable,
): Datable {
    try {
        return callback();
    } catch {
        return def;
    }
}

export function executeSync(cmd: string) {
    const process = exec(cmd);

    if (process && process.stdout) {
        process.stdout.on("data", (data) => {
            Deno.stdout.write(new TextEncoder().encode(data.toString()));
        });
    }

    if (process && process.stderr) {
        process.stderr.on("data", (data) => {
            Deno.stdout.write(new TextEncoder().encode(data.toString()));
        });
    }
    return process;
}

export function execute(cmd: string, options?: ExecOptions): Promise<void> {
    return new Promise((resolve) => {
        const process = exec(cmd, options);

        if (process && process.stdout) {
            process.stdout.on("data", (data) => {
                Deno.stdout.write(new TextEncoder().encode(data.toString()));
            });
        }

        if (process && process.stderr) {
            process.stderr.on("data", (data) => {
                Deno.stdout.write(new TextEncoder().encode(data.toString()));
            });
        }

        process.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                console.error(`Process exited with code ${code}`);
                resolve();
            }
        });

        process.on("error", (err) => {
            console.error(`Child Error: ${err.message}`);
            resolve();
        });
    });
}
/**
 * Loggings Configurations
 */
LoggingsConfig({
    register_dir: "storage",
    register_locale_file: "{register_dir}/logs",
    register_filename: "{year}-{month}-{day}.{ext}",
});

/**
 * Globalizes the logging system by replacing the default `console` methods
 * with custom methods that use the `Loggings` class for log level control
 * and formatting.
 */
export const logger = new Loggings("Dashboard", "gold");
globalThis.loggings = logger;
globalThis.console = {
    ...globalThis.console,
    log: (...msg) => globalThis.loggings!.log(...msg),
    error: (...msg) => globalThis.loggings!.error(...msg),
    warn: (...msg) => globalThis.loggings!.warn(...msg),
    info: (...msg) => globalThis.loggings!.info(...msg),
    debug: (...msg) => globalThis.loggings!.debug(...msg),
};
