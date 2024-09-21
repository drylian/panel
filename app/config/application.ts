import { ConfigType, Configuration } from "@/controllers/config";

export const ApplicationConf = {
    /**
     * Configuration for the environment type.
     * 
     * @default "development"
     */
    node: new Configuration({
        env: "NODE_ENV",
        type: ConfigType.String,
        def: "development",
    }),

    /**
     * Main port of the application.
     * 
     * @default 3000
     */
    port: new Configuration({
        env: "APP_PORT",
        type: ConfigType.Number,
        def: 3000,
    }),

    /**
     * Main Language of Application.
     * 
     * @default en_US
     */
    lang: new Configuration({
        env: "APP_LANGUAGE",
        type: ConfigType.String,
        def: "en_US",
    }),

    /**
     * Hostname of Application
     * 
     * @default "0.0.0.0"
     */
    hostname: new Configuration({
        env: "APP_HOSTNAME",
        type: ConfigType.String,
        def: "0.0.0.0"
    }),

    /**
     * Configuration for enabling or disabling debug mode.
     * 
     * @default false
     */
    debug: new Configuration({
        env: "DEBUG",
        type: ConfigType.Boolean,
        def: false,
    }),
}