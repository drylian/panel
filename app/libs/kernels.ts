import { Kernel } from "@/controllers/kernel";
import lodash from "lodash";
import { BaseEntity } from "typeorm";
import { DatabaseConnection } from "@/controllers/database";
import { trySet, watcher } from "@/libs/utils";
import path from "node:path";
import { HttpController } from "@/http";
import { readFile } from "node:fs/promises";
console.log(__("loading_kernels"));

/**
 * Watcher of env options
 */
new Kernel({
  priority: 0,
  async after() {
    watcher("langs", async (event, filepath) => {
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
          .relative("langs", filepath)
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
  priority: 1,
  after() {
    watcher(".env", async () => {
      Env.init();
      if (i18n.live.current !== Env.get("app.lang"))
        i18n.live.sl(Env.get("app.lang"));
    });
  },
});

/**
 * Database Configuration
 */
new Kernel({
  priority: 2,
  path: ["models/**/*.ts"],
  run({ module: file }) {
    const model = file as { default: typeof BaseEntity };
    if (DatabaseConnection.models) {
      DatabaseConnection.models.push(model.default);
    }
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
  priority: 3,
  async after() {
    const server = await HttpController();
    server.listen({
      port: Env.get("app.port"),
    });
  },
});