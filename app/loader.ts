import "@/config";
import "@/helpers";
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
import { Language } from "@/controllers/langs";
console.log("Loading [kernels].green...");
/**
 * Watcher of env options
 */
new Kernel({
    identify: "LanguageWatcher",
    priority: 0,
    after() {
        watcher("locales/**", async (event, filepath) => {

            if (path.extname(filepath) === ".json") {
                const lang = filepath.replaceAll("\\", "/").split("/").slice(1, 2)![0];
                const locale = path.relative(path.join("locales", lang), filepath)
                    .replace(".json", "").replace(/[/\\]/g, ".");
                    const location = path
                            .relative("locales", filepath)
                            .replace(".json", "")
                            .replace(/[/\\]/g, " -> ");
                switch (event) {
                    case "create":
                        Language.core.set(lang, lodash.merge(Language.core.get(lang) ?? {}, lodash.set(
                            {},
                            locale.split("."),
                            trySet(async () => JSON.parse(await readFile(filepath, "utf-8")), {} as any),
                        )));
                        break;
                    case "delete":
                        Language.core.set(lang, lodash.merge(Language.core.get(lang) ?? {}, lodash.set(
                            {},
                            locale.split("."),
                            trySet(async () => JSON.parse(await readFile(filepath, "utf-8")), {} as any),
                        )));
                        console.debug(`LANG:[[${location}].red deleted.`);
                        break;
                    case "edit":
                        Language.core.set(lang, lodash.merge(Language.core.get(lang) ?? {}, lodash.set(
                            {},
                            locale.split("."),
                            trySet(async () => JSON.parse(await readFile(filepath, "utf-8")), {} as any),
                        )));
                        console.debug(`LANG:[${location}].red modded.`);
                        break;
                }
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
            Config.reload();
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
    after() {
        const app = fastify();

        if (Config.get("node") === "development") {
            Vite(app);
            console.log(
                `[RESTAPI].blue is running on port [${Config.get("port")}].port`,
            );
            console.log(`[VITE].blue is running on port ${VITE_PORT}`);
        } else {
            console.log(
                `Dashboard is running on port [${Config.get("port")}].port`,
            );
        }

        app.listen({
            port: Config.get("port"),
            host: Config.get("hostname"),
        });
    },
});
await Kernel.initialize();
await Terminal.start();
