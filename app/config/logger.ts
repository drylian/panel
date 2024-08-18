import { Config, Configuration } from "@/controllers/configuration.ts";
import { LoggingsLevel } from "loggings";

export const LoggerConf = {
    /**
     * Level of register/show logger
     */
    log_level: new Configuration<LoggingsLevel>({
        env: "LOG_LEVEL",
        type: Config.String,
        def: "Info",
        chk(_value, def) {
            const value = _value.toLocaleLowerCase();
            const level = value.charAt(0).toUpperCase() + value.slice(1)
            if (["Debug", "Info", "Warn", "Error"].includes(level)) {
                return level as LoggingsLevel;
            }
            return def;
        },
    }),
};
