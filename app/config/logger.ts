import { EnvConfiguration } from "@/controllers/configs/EnvConfiguration";
import { LoggingsLevel } from "@loggings/beta/dist/types/libs/types";
const Config = EnvConfiguration.type;

export const LoggerConf = {
    /**
     * Level of register/show logger
     */
    log_level: new EnvConfiguration<LoggingsLevel>({
        env: "LOG_LEVEL",
        type: Config.String,
        def: "info",
        chk(_value, def) {
            const value = _value.toLocaleLowerCase();
            const level = value.charAt(0).toUpperCase() + value.slice(1)
            if (["debug", "info", "warn", "error"].includes(level)) {
                return level as LoggingsLevel;
            }
            return def;
        },
    }),
};
