import { Config } from "@/controllers/config";
import { DatabaseConf } from "./database";
import { ApplicationConf } from "./application";
import { LoggerConf } from "./logger";

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