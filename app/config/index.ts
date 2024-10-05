import { Config } from "@/controllers/config";
import { DatabaseConf } from "./database";
import { ApplicationConf } from "./application";
import { LoggerConf } from "./logger";
import { Loggings } from "@loggings/beta";
import { glob } from "glob";
import { readFile } from "fs/promises";
import { trySet } from "@/helpers";
import _ from "lodash";

const GlobalConfigurations = {
  ...ApplicationConf,
  ...DatabaseConf,
  ...LoggerConf,
};

/**
 * This type is used by the system to know the settings set in the panel,
 * DO NOT CHANGE IT
 */
export type ApplicationConfig = typeof GlobalConfigurations;
/**
 * This sets Config to act globally
 */
Config.useConfig(GlobalConfigurations);
/**
 * Set Loggings colors
 */
const { i18n } = await import("@/controllers/i18n");
/**
 * Loggings Configurations
 */
Loggings.config({
  register_dir: "storage",
  register_locale_file: "{register_dir}/logs",
  register_filename: "{year}-{month}-{day}.{ext}",
});

/**
 * Load primary lang of dashboard
 */
const paths = await glob("locales/**/*.json");
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
export const logger = new Loggings(Config.get("title"), "gold");
Loggings.useConsole(logger);
