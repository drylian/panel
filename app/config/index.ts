import { EnvConfiguration } from "@/controllers/configs/envConfiguration";
import { DatabaseConf } from "@/config/database";
import { LoggerConf } from "@/config/logger";
const Config = EnvConfiguration.type;

const Configurations = {
    /**
     * Configuration for the environment type.
     * 
     * @default "development"
     */
    node: new EnvConfiguration({
        env: "NODE_ENV",
        type: Config.String,
        def: "development",
    }),
    
    /**
     * Main port of the application.
     * 
     * @default 3000
     */
    port: new EnvConfiguration({
        env: "APP_PORT",
        type: Config.Number,
        def: 3000,
    }),

    /**
     * Main Language of Application.
     * 
     * @default en_US
     */
    lang: new EnvConfiguration({
        env: "APP_LANGUAGE",
        type: Config.String,
        def: "en_US",
    }),

    /**
     * Hostname of Application
     * 
     * @default "0.0.0.0"
     */
    hostname: new EnvConfiguration({
        env: "APP_HOSTNAME",
        type: Config.String,
        def:"0.0.0.0"
    }),

    /**
     * Configuration for enabling or disabling debug mode.
     * 
     * @default false
     */
    debug: new EnvConfiguration({
        env: "DEBUG",
        type: Config.Boolean,
        def: false,
    }),
    
    ...LoggerConf,
    ...DatabaseConf
};
export type Configurations = typeof Configurations;
global.__Configurations = Configurations;

/**
 * Initializes the configuration by applying the settings.
 * This function reads the environment variables and applies them to the Configuration.
 * 
 * @function
 */
EnvConfiguration.config();
