import "@/config";
import { Kernel } from "@/controllers/kernel";
import lodash from "lodash";
import { Vite, VITE_PORT } from "@/libs/vite";
import { Terminal } from "@/controllers/terminal";
import fastify from "fastify";
import { BaseEntity } from "typeorm";
import { DatabaseConnection } from "./controllers/database";
import { trySet, watcher } from "@/helpers";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { i18n } from "@/controllers/i18n";
import { HttpController } from "./http";
console.log(__("loading_kernels"));

/**
 * Watcher of env options
 */
new Kernel({
  identify: "i18nWatcher",
  priority: 0,
  async after() {
    watcher("locales", async (event, filepath) => {
      if (path.extname(filepath) === ".json") {
        const file = await readFile(filepath, "utf-8");
        const lang = filepath.replaceAll("\\", "/").split("/").slice(1, 2)![0];
        const json_data = trySet(() => JSON.parse(file as string), {});
        const local = filepath
          .replaceAll("\\", "/")
          .split("/")
          .slice(2)
          .join("/");
        const locale = local.replace(".json", "").replace(/[/\\]/g, ".");
        const data = lodash.set({}, locale, json_data);
        const location = `[${path
          .relative("locales", filepath)
          .replace(".json", "")
          .replace(/[/\\]/g, "].nred -> [")}].blue`;
        i18n.core.set(lang, lodash.merge(i18n.core.get(lang) ?? {}, data));
        console.debug(__(`lang_${event}`, { location }));
      }
    });
  },
});

/**
 * Watcher of env options
 */
new Kernel({
  identify: "Configuration",
  priority: 1,
  after() {
    watcher(".env", async () => {
      Config.reload(true);
      if (i18n.live.current !== Config.get("lang"))
        i18n.live.sl(Config.get("lang"));
    });
  },
});

/**
 * Database Configuration
 */
new Kernel({
  identify: "Database",
  priority: 2,
  imports: {
    type: "module",
    cwd: "app",
    paths: ["models/**/*.ts"],
    action(file) {
      const model = file as { default: typeof BaseEntity };
      if (DatabaseConnection.models) {
        DatabaseConnection.models.push(model.default);
      }
    },
  },
  async after() {
    DatabaseConnection.preset();
    await DatabaseConnection.connection!.initialize();
  },
});

/**
 * Http configuration Kernel
 */
new Kernel({
  identify: "Http",
  priority: 3,
  async after() {
    const server = await HttpController();
    server.listen({
      port: Config.get("port"),
      host: Config.get("hostname"),
    });
  },
});
await Kernel.initialize();
await Terminal.start();
