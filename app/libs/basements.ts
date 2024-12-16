import { trySet } from "@/libs/utils";
import { Loggings } from "@loggings/beta";
import { readFile } from "fs/promises";
import { glob } from "glob";
import _ from "lodash";

/**
 * Set Loggings colors
 */
const { i18n } = await import("@/controllers/i18n");

/**
 * Load primary lang of dashboard
 */
const paths = await glob("langs/**/*.json");
for (const filepath of paths) {
   const file = await readFile(filepath, "utf-8");
   const lang = filepath.replaceAll("\\", "/").split("/").slice(1, 2)![0];
   const json_data = trySet(() => JSON.parse(file as string), {});
   const local = filepath.replaceAll("\\", "/").split("/").slice(2).join("/");
   const locale = local.replace(".json", "").replace(/[/\\]/g, ".");
   const data = _.set({}, locale, json_data);
   i18n.core.set(lang, _.merge(i18n.core.get(lang) ?? {}, data));
}

global.i18n = i18n;
global.__ = (key, params) => {
   return global.i18n.live.trans(key, {
      namespace: "console",
      ...(params ? params : {}),
   });
};

/**
 * Globalizes the logging system by replacing the default `console` methods
 * with custom methods that use the `Loggings` class for log level control
 * and formatting.
 */
export const logger = new Loggings(Env.get("app.name"), "gold");
Loggings.useConsole(logger);