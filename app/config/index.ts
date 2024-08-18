import { Config, Configuration } from "../controllers/configuration.ts";
import { LoggerConf } from "./logger.ts";

/**
 * Global configuration settings for the Dashboard application.
 * This object defines various configuration parameters used throughout the application.
 * 
 */
export const Global = {
    /**
     * Configuration for the environment type.
     * 
     * @default "development"
     */
    node: new Configuration({
        env: "NODE_ENV",
        type: Config.String,
        def: "development",
    }),
    
    /**
     * Main port of the application.
     * 
     * @default 3000
     */
    port: new Configuration({
        env: "APP_PORT",
        type: Config.Number,
        def: 3000,
    }),

    /**
     * Port used for development.
     * This port is used by Vite for development React applications and the dashboard API.
     * 
     * @default 3001
     */
    dev_port: new Configuration({
        env: "APP_DEVPORT",
        type: Config.Number,
        def: 3001,
    }),

    /**
     * Hostname of Application
     * 
     * @default "0.0.0.0"
     */
    hostname: new Configuration({
        env: "APP_HOSTNAME",
        type: Config.String,
        def:"0.0.0.0"
    }),

    /**
     * Configuration for enabling or disabling debug mode.
     * 
     * @default false
     */
    debug: new Configuration({
        env: "DEBUG",
        type: Config.Boolean,
        def: false,
    }),
    
    /**
     * Additional logger configuration settings.
     * These settings are imported from the LoggerConf module.
     * 
     * @type {Object}
     */
    ...LoggerConf
};

/**
 * Initializes the configuration by applying the settings.
 * This function reads the environment variables and applies them to the Configuration.
 * 
 * @function
 */
Configuration.config();
