import { Config } from "@/controllers/config";
global.Config = Config;
import { Loggings, LoggingsConsole } from "@loggings/beta";
import { exec, ExecOptions } from "node:child_process";
import { Language, LoggingsTranslatorPlugin } from "@/controllers/langs";
import { existsSync, FSWatcher, watch } from "node:fs";
import { glob } from "glob";
import { join } from "node:path";
import _ from "lodash";
import { readFile } from "node:fs/promises";

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

/**
 * Executes a shell command synchronously and writes the output to the Deno stdout.
 *
 * @param {string} cmd - The command to be executed.
 * @returns {ChildProcess} The spawned child process.
 *
 * @example
 * executeSync("ls -la");
 */
export function executeSync(cmd: string) {
    const _process = exec(cmd);

    if (_process && _process.stdout) {
        _process.stdout.on("data", (data) => {
            process.stdout.write(data.toString());
        });
    }

    if (_process && _process.stderr) {
        _process.stderr.on("data", (data) => {
            process.stdout.write(data.toString());
        });
    }

    return process;
}

/**
 * Executes a shell command asynchronously and writes the output to the Deno stdout.
 *
 * @param {string} cmd - The command to be executed.
 * @param {ExecOptions} [options] - Optional options to configure the execution.
 * @returns {Promise<void>} A promise that resolves when the command completes.
 *
 * @example
 * execute("ls -la")
 *   .then(() => console.log("Command executed successfully!"))
 *   .catch(err => console.error(`Failed to execute command: ${err.message}`));
 */
export function execute(cmd: string, options?: ExecOptions): Promise<void> {
    return new Promise((resolve) => {
        const _process = exec(cmd, options);

        if (_process && _process.stdout) {
            _process.stdout.on("data", (data) => {
                process.stdout.write(data.toString());
            });
        }

        if (_process && _process.stderr) {
            _process.stderr.on("data", (data) => {
                process.stdout.write(data.toString());
            });
        }

        _process.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                console.error(`Process exited with code ${code}`);
                resolve();
            }
        });

        _process.on("error", (err) => {
            console.error(`Child Error: ${err.message}`);
            resolve();
        });
    });
}

/**
 * Extending fs watch to something more useful
 */
export async function watcher(
    path: string,
    callback: (
        event: "delete" | "edit" | "create",
        filepath: string,
    ) => Promise<void>,
    cwd?: string,
    timeout_ = 700
) {
    const watchers: Record<string, FSWatcher> = {};
    async function loadfiles() {
        const files = await glob(path, { cwd: cwd });
        files.forEach(async (locale) => {
            //load event "delete"
            if (!existsSync(join(cwd ? cwd : "", locale)) && watchers[locale]) {
                delete watchers[locale];
                await callback("delete", locale);
            }
            // load event "create"
            else if (existsSync(join(cwd ? cwd : "", locale)) && !watchers[locale]) {
                await callback("create", locale);
                watchers[locale] = watch(locale, function () {
                    let timeout: NodeJS.Timeout | null = null;
                    if (!timeout) {
                        loadfiles();
                        timeout = setTimeout(function () {
                            timeout = null;
                        }, timeout_);
                    }
                });
            }
            // load event "edit"
            else {
                await callback("edit", locale);
            }
        });
    }
    await loadfiles();
}

/**
 * Loggings Configurations
 */
Loggings.config({
    register_dir: "storage",
    register_locale_file: "{register_dir}/logs",
    register_filename: "{year}-{month}-{day}.{ext}",
});

global.Language = Language;
/**
 * Remove original Console viewer of loggings
 */
Loggings.rem(LoggingsConsole.identify);
/**
 * Add custom Console viewer of loggings
 */
Loggings.add(LoggingsTranslatorPlugin);
/**
 * Globalizes the logging system by replacing the default `console` methods
 * with custom methods that use the `Loggings` class for log level control
 * and formatting.
 */
export const logger = new Loggings("Dashboard", "gold");
Loggings.useConsole(logger);
global.console.use = global.Language.live.use;

/**
 * Load primary lang of dashboard
 */
const paths = await glob(
    "locales/**/*.json",
);
for await (const filepath of paths) {
    const file = await readFile(filepath, "utf-8");
    const lang = filepath.replaceAll("\\", "/").split("/").slice(1, 2)![0];
    const json_data = trySet(() => JSON.parse(file as string), {});
    const local = filepath.split("\\").slice(2).join("/");
    const locale = local.replace(".json", "").replace(/[/\\]/g, ".");
    const data = _.set({}, locale, json_data);
    Language.core.set(lang, _.merge(Language.core.get(lang) ?? {}, data));
}
