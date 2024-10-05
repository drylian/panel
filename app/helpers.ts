import { Loggings } from "@loggings/beta";
import { exec, ExecOptions } from "node:child_process";
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
export function watcher(
  path: string,
  callback: (
    event: "delete" | "edit" | "create",
    filepath: string,
  ) => Promise<void>,
  timeout_ = 700,
) {
  const watched_files: Record<string, string> = {};
  watch(path, { recursive: true }, async function (_, filename) {
    let timeout: NodeJS.Timeout | null = null;
    if (!timeout) {
      if (filename) await loadfiles(join(path, filename));
      timeout = setTimeout(function () {
        timeout = null;
      }, timeout_);
    }
  });
  async function loadfiles(locale: string) {
    //load event "delete"
    if (!existsSync(locale) && watched_files[locale]) {
      delete watched_files[locale];
      await callback("delete", locale);
    }
    // load event "create"
    else if (existsSync(locale) && !watched_files[locale]) {
      await callback("create", locale);
      watched_files[locale] = locale;
    }
    // load event "edit"
    else {
      await callback("edit", locale);
    }
  }
}
